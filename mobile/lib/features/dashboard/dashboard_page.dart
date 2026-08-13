import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_result.dart';
import '../../core/network/providers.dart';
import '../../core/theme/tokens.dart';
import '../../shared/widgets/common.dart';

/// Mission Control. Momentum first, then the pipeline, then what to do today.
class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  static String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.c;
    final profile = ref.watch(profileProvider);
    final notes = ref.watch(notificationsProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(profileProvider);
            ref.invalidate(notificationsProvider);
            await ref.read(profileProvider.future);
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(T.pad, 18, T.pad, 8),
                sliver: SliverToBoxAdapter(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_greeting()}, Aditya.',
                        style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 30),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Pulse(),
                          const SizedBox(width: 9),
                          Expanded(
                            child: Text(
                              'Your AI Career Agent is working for you.',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              SliverPadding(
                padding: const EdgeInsets.fromLTRB(T.pad, 12, T.pad, 100),
                sliver: SliverList.list(
                  children: [
                    profile.when(
                      loading: () => const LoadingRows(rows: 2),
                      error: (e, _) => ErrorStateView(
                        // Repositories rethrow the typed ApiError, whose message is
                        // already written to be read by a person.
                        message: e is ApiError ? e.message : 'We could not load your profile.',
                        onRetry: () => ref.invalidate(profileProvider),
                      ),
                      data: (p) => Column(
                        children: [
                          Panel(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              children: [
                                Ring(value: p.momentum.value, size: 150, stroke: 9, label: '/ 100'),
                                const SizedBox(height: 18),
                                Text('Career Momentum',
                                    style: Theme.of(context).textTheme.titleMedium),
                                const SizedBox(height: 4),
                                Text(
                                  '+${p.momentum.deltaWeek}% this week · next milestone ${p.momentum.nextMilestone}',
                                  style: Theme.of(context).textTheme.bodySmall,
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 20),
                                for (final inp in p.momentum.inputs) ...[
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(inp.label,
                                            style: Theme.of(context).textTheme.bodySmall),
                                      ),
                                      Text('${inp.value}',
                                          style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: c.ink)),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Meter(value: inp.value, height: 3),
                                  const SizedBox(height: 12),
                                ],
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          const _SignalGrid(),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),
                    const _PipelineStrip(),
                    const SizedBox(height: 12),

                    Panel(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.auto_awesome_outlined, size: 15, color: c.iris),
                              const SizedBox(width: 8),
                              const Rail('What the agent recommends today'),
                            ],
                          ),
                          const SizedBox(height: 16),
                          for (final t in const [
                            'Approve the four prepared applications — they expire from the feed in two days.',
                            'Accept the three resume rewrites; your keyword match moves 82% to 94%.',
                            'Run one system-design round. It is the only gap in all four top matches.',
                          ]) ...[
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  margin: const EdgeInsets.only(top: 6, right: 10),
                                  width: 4, height: 4,
                                  decoration: BoxDecoration(color: c.iris, shape: BoxShape.circle),
                                ),
                                Expanded(
                                  child: Text(t, style: Theme.of(context).textTheme.bodyMedium),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                          ],
                          const SizedBox(height: 4),
                          SizedBox(
                            width: double.infinity,
                            child: FilledButton(
                              onPressed: () => context.go('/applications'),
                              child: const Text('Review 4 applications'),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    notes.when(
                      loading: () => const LoadingRows(rows: 2),
                      error: (_, __) => const SizedBox.shrink(),
                      data: (list) => Panel(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Rail('Notifications'),
                                const Spacer(),
                                Chip_('${list.where((n) => !n.read).length} new', tone: ChipTone.iris),
                              ],
                            ),
                            const SizedBox(height: 14),
                            for (final n in list.take(4)) ...[
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    margin: const EdgeInsets.only(top: 6, right: 10),
                                    width: 6, height: 6,
                                    decoration: BoxDecoration(
                                      color: n.read ? c.line2 : c.iris,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(n.title,
                                            style: TextStyle(
                                                fontSize: 13.5,
                                                fontWeight: FontWeight.w600,
                                                color: c.ink)),
                                        const SizedBox(height: 2),
                                        Text(n.body,
                                            style: Theme.of(context).textTheme.bodySmall),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SignalGrid extends StatelessWidget {
  const _SignalGrid();

  static const _signals = [
    (label: 'Jobs discovered', value: '248', delta: '+31 today'),
    (label: 'High-fit roles', value: '31', delta: 'above 85%'),
    (label: 'Applications', value: '124', delta: '4 need approval'),
    (label: 'Interviews', value: '8', delta: '+2 this week'),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.65,
      children: [
        for (final s in _signals)
          Panel(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Rail(s.label),
                Text(s.value,
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w600, height: 1, color: c.ink)),
                Text(s.delta, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
      ],
    );
  }
}

class _PipelineStrip extends StatefulWidget {
  const _PipelineStrip();

  @override
  State<_PipelineStrip> createState() => _PipelineStripState();
}

class _PipelineStripState extends State<_PipelineStrip> {
  int _active = 0;

  static const _stages = [
    (label: 'Discover', count: 248, detail: '248 roles pulled from 41 sources in 24 hours. 31 clear your bar.'),
    (label: 'Match', count: 31, detail: 'Each scored across eight axes. Four are above 94%.'),
    (label: 'Prepare', count: 12, detail: 'Tailored and drafted. Four wait on your approval.'),
    (label: 'Apply', count: 124, detail: 'Autopilot sent 61 at high confidence, inside your rules.'),
    (label: 'Interview', count: 8, detail: 'The Northwind panel is tomorrow at 11:00.'),
    (label: 'Offer', count: 2, detail: 'Ridgeline is verbal at ₹28L — below band for your level.'),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Panel(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 86,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 6),
              itemCount: _stages.length,
              itemBuilder: (_, i) {
                final s = _stages[i];
                final on = i == _active;
                return Semantics(
                  selected: on,
                  button: true,
                  child: InkWell(
                    onTap: () => setState(() => _active = i),
                    borderRadius: BorderRadius.circular(T.rMd),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      width: 104,
                      margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: on ? c.iris.withValues(alpha: 0.10) : Colors.transparent,
                        borderRadius: BorderRadius.circular(T.rMd),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Rail(s.label, color: on ? c.iris : null),
                          Text('${s.count}',
                              style: TextStyle(
                                  fontSize: 20, fontWeight: FontWeight.w600, height: 1, color: c.ink)),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: c.surface2,
              border: Border(top: BorderSide(color: c.line)),
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(T.rLg)),
            ),
            child: Text(_stages[_active].detail, style: Theme.of(context).textTheme.bodyMedium),
          ),
        ],
      ),
    );
  }
}
