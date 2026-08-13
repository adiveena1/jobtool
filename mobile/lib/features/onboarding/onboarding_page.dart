import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/tokens.dart';
import '../../shared/widgets/common.dart';

/// Career DNA onboarding, native.
///
/// One scrolling surface with a live summary pinned to the bottom, rather than
/// a paginated wizard — every answer stays visible and the profile assembling
/// underneath is the reason to keep going.
class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  static const _who = [
    'Student', 'Graduate', 'Software Engineer', 'Designer',
    'Cybersecurity Professional', 'Data Scientist', 'Product Manager', 'Other',
  ];
  static const _levels = ['Student', 'Entry level', '1–3 years', '3–6 years', '6+ years'];
  static const _modes = ['Remote', 'Hybrid', 'On-site', 'No preference'];
  static const _locations = ['Bangalore', 'Hyderabad', 'Pune', 'Delhi NCR', 'Remote — India'];
  static const _skills = [
    'React', 'Next.js', 'TypeScript', 'Python', 'PostgreSQL',
    'Go', 'Docker', 'AWS', 'System Design', 'LLM Applications',
  ];
  static const _industries = ['AI', 'SaaS', 'Cybersecurity', 'Fintech', 'Developer tools'];
  static const _salary = ['₹6L+', '₹10L+', '₹15L+', '₹25L+', '₹40L+'];

  String _role = 'Software Engineer';
  String _level = '1–3 years';
  String _mode = 'Remote';
  String _pay = '₹15L+';
  final _picked = <String>{'Bangalore', 'Remote — India'};
  final _mySkills = <String>{'React', 'Next.js', 'TypeScript', 'Python'};
  final _goals = <String>{'AI', 'SaaS'};

  int get _completeness {
    final checks = [
      _role.isNotEmpty, _level.isNotEmpty, _mode.isNotEmpty, _pay.isNotEmpty,
      _picked.isNotEmpty, _mySkills.length >= 3, _goals.isNotEmpty,
    ];
    return ((checks.where((x) => x).length / checks.length) * 100).round();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Build your Career DNA'),
        actions: [
          TextButton(onPressed: () => context.go('/home'), child: const Text('Skip')),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(T.pad, 8, T.pad, T.pad),
          children: [
            Text('Seven answers. Then the agent takes over.',
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
              'Nothing here is required. Answer what is true and skip the rest — the agent '
              'will tell you which gaps are costing you.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 22),

            _Section(
              rail: '01',
              title: 'Who are you right now?',
              child: _Picker(
                options: _who,
                selected: {_role},
                onTap: (v) => setState(() => _role = v),
              ),
            ),
            _Section(
              rail: '02',
              title: 'Experience level',
              child: _Picker(
                options: _levels,
                selected: {_level},
                onTap: (v) => setState(() => _level = v),
              ),
            ),
            _Section(
              rail: '03',
              title: 'How do you want to work?',
              child: _Picker(
                options: _modes,
                selected: {_mode},
                onTap: (v) => setState(() => _mode = v),
              ),
            ),
            _Section(
              rail: '04',
              title: 'Preferred locations',
              child: _Picker(
                options: _locations,
                selected: _picked,
                multi: true,
                onTap: (v) => setState(() => _picked.contains(v) ? _picked.remove(v) : _picked.add(v)),
              ),
            ),
            _Section(
              rail: '05',
              title: 'Salary floor',
              hint: 'The agent will not apply below this.',
              child: _Picker(
                options: _salary,
                selected: {_pay},
                onTap: (v) => setState(() => _pay = v),
              ),
            ),
            _Section(
              rail: '06',
              title: 'What can you actually do?',
              hint: 'Pick what you would defend in an interview.',
              child: _Picker(
                options: _skills,
                selected: _mySkills,
                multi: true,
                onTap: (v) =>
                    setState(() => _mySkills.contains(v) ? _mySkills.remove(v) : _mySkills.add(v)),
              ),
            ),
            _Section(
              rail: '07',
              title: 'Where is this going?',
              child: _Picker(
                options: _industries,
                selected: _goals,
                multi: true,
                onTap: (v) => setState(() => _goals.contains(v) ? _goals.remove(v) : _goals.add(v)),
              ),
            ),

            const SizedBox(height: 8),
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Pulse(),
                      const SizedBox(width: 9),
                      const Expanded(child: Rail('Assembling')),
                      Text('$_completeness%',
                          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: c.ink)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Meter(value: _completeness, height: 5,
                      tone: _completeness > 85 ? c.positive : c.iris),
                  const SizedBox(height: 16),
                  Text('$_role · $_level · $_mode · $_pay',
                      style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 8),
                  Text('${_mySkills.length} skills · ${_picked.length} locations · ${_goals.length} goals',
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => context.go('/home'),
              child: const Text('Generate my Career DNA'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.rail, required this.title, required this.child, this.hint});

  final String rail, title;
  final String? hint;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Panel(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Rail(rail, color: context.c.iris),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: Theme.of(context).textTheme.titleMedium),
                      if (hint != null) ...[
                        const SizedBox(height: 3),
                        Text(hint!, style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            child,
          ],
        ),
      ),
    );
  }
}

class _Picker extends StatelessWidget {
  const _Picker({
    required this.options,
    required this.selected,
    required this.onTap,
    this.multi = false,
  });

  final List<String> options;
  final Set<String> selected;
  final void Function(String) onTap;
  final bool multi;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final o in options)
          Semantics(
            selected: selected.contains(o),
            button: true,
            child: InkWell(
              borderRadius: BorderRadius.circular(T.rSm),
              onTap: () => onTap(o),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 160),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(
                  color: selected.contains(o) ? c.iris : c.surface2,
                  borderRadius: BorderRadius.circular(T.rSm),
                  border: Border.all(color: selected.contains(o) ? c.iris : c.line),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (selected.contains(o)) ...[
                      const Icon(Icons.check_rounded, size: 13, color: Colors.white),
                      const SizedBox(width: 6),
                    ],
                    Text(
                      o,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: selected.contains(o) ? Colors.white : c.ink2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
