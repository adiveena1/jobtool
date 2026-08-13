import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/providers.dart';
import '../../core/theme/tokens.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/common.dart';

/// Career Copilot.
///
/// Answers arrive as briefs — a claim, then the evidence from the profile it
/// was drawn from. Deliberately not a stack of chat bubbles: the point of one
/// career brain is that the agent can always show its working.
class CopilotPage extends ConsumerStatefulWidget {
  const CopilotPage({super.key});

  @override
  ConsumerState<CopilotPage> createState() => _CopilotPageState();
}

class _CopilotPageState extends ConsumerState<CopilotPage> {
  final _controller = TextEditingController();
  final _scroll = ScrollController();
  final _turns = <AiMessage>[];
  bool _thinking = false;

  static const _prompts = [
    'Why am I not getting interviews?',
    "What's my biggest career gap?",
    'Find frontend jobs above ₹15L.',
    'Prepare me for tomorrow.',
  ];

  @override
  void initState() {
    super.initState();
    _ask('hello', silent: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _ask(String text, {bool silent = false}) async {
    if (text.trim().isEmpty || _thinking) return;

    setState(() {
      if (!silent) _turns.add(AiMessage.user(text));
      _thinking = true;
    });
    _controller.clear();
    _toBottom();

    final res = await ref.read(repositoryProvider).ask(text);
    if (!mounted) return;

    res.when(
      success: (msg, _) => setState(() {
        _turns.add(msg);
        _thinking = false;
      }),
      failure: (e) => setState(() {
        _turns.add(AiMessage(id: 'err', isAgent: true, text: e.message));
        _thinking = false;
      }),
    );
    _toBottom();
  }

  void _toBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scroll.hasClients) return;
      _scroll.animateTo(
        _scroll.position.maxScrollExtent,
        duration: const Duration(milliseconds: 260),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: T.pad,
        title: Row(
          children: [
            const Pulse(),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Career Copilot'),
                  Text('Reading your full profile',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 11.5)),
                ],
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scroll,
                padding: const EdgeInsets.fromLTRB(T.pad, 8, T.pad, 8),
                itemCount: _turns.length + (_thinking ? 1 : 0),
                itemBuilder: (_, i) {
                  if (i >= _turns.length) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 15, height: 15,
                            child: CircularProgressIndicator(strokeWidth: 2, color: c.iris),
                          ),
                          const SizedBox(width: 10),
                          Text('reading your profile…',
                              style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    );
                  }
                  return _Turn(msg: _turns[i]);
                },
              ),
            ),

            SizedBox(
              height: 42,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: T.pad),
                children: [
                  for (final p in _prompts)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ActionChip(
                        label: Text(p, style: const TextStyle(fontSize: 12.5)),
                        onPressed: () => _ask(p),
                        backgroundColor: c.surface2,
                        side: BorderSide(color: c.line),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(T.rSm)),
                      ),
                    ),
                ],
              ),
            ),

            Container(
              padding: const EdgeInsets.fromLTRB(T.pad, 10, T.pad, 14),
              decoration: BoxDecoration(border: Border(top: BorderSide(color: c.line))),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      textInputAction: TextInputAction.send,
                      onSubmitted: _ask,
                      decoration: const InputDecoration(hintText: 'Ask your career agent…'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                    height: 48, width: 48,
                    child: FilledButton(
                      onPressed: _thinking ? null : () => _ask(_controller.text),
                      style: FilledButton.styleFrom(padding: EdgeInsets.zero),
                      child: const Icon(Icons.arrow_upward_rounded, size: 19),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Turn extends StatelessWidget {
  const _Turn({required this.msg});
  final AiMessage msg;

  @override
  Widget build(BuildContext context) {
    final c = context.c;

    if (!msg.isAgent) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 7),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
          decoration: BoxDecoration(
            color: c.iris,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(14),
              topRight: Radius.circular(14),
              bottomLeft: Radius.circular(14),
              bottomRight: Radius.circular(4),
            ),
          ),
          child: Text(msg.text, style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.45)),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.auto_awesome_outlined, size: 13, color: c.iris),
              const SizedBox(width: 7),
              const Rail('Agent'),
            ],
          ),
          const SizedBox(height: 8),
          Text(msg.text,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 14.5, color: c.ink)),
          if (msg.facts.isNotEmpty) ...[
            const SizedBox(height: 12),
            for (final f in msg.facts)
              Padding(
                padding: const EdgeInsets.only(bottom: 7),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 7, right: 10),
                      width: 3.5, height: 3.5,
                      decoration: BoxDecoration(color: c.iris, shape: BoxShape.circle),
                    ),
                    Expanded(
                      child: Text(f, style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 13)),
                    ),
                  ],
                ),
              ),
          ],
        ],
      ),
    );
  }
}
