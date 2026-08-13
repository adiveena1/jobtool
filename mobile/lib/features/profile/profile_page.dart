import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/providers.dart';
import '../../core/theme/tokens.dart';
import '../../shared/widgets/common.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.c;
    final profile = ref.watch(profileProvider);
    final theme = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Your Career DNA')),
      body: SafeArea(
        top: false,
        child: profile.when(
          loading: () => const Padding(padding: EdgeInsets.all(T.pad), child: LoadingRows(rows: 3)),
          error: (_, __) => ErrorStateView(
            message: 'We could not load your profile.',
            onRetry: () => ref.invalidate(profileProvider),
          ),
          data: (p) => ListView(
            padding: const EdgeInsets.fromLTRB(T.pad, 8, T.pad, 110),
            children: [
              Panel(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Container(
                      width: 62, height: 62,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: c.iris.withValues(alpha: 0.11),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: c.iris.withValues(alpha: 0.24)),
                      ),
                      child: Text('AD',
                          style: TextStyle(fontSize: 21, fontWeight: FontWeight.w600, color: c.iris)),
                    ),
                    const SizedBox(height: 14),
                    Text('Aditya', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 3),
                    Text('${p.title} · ${p.yearsExperience} years',
                        style: Theme.of(context).textTheme.bodySmall),
                    const SizedBox(height: 22),
                    Ring(value: p.momentum.value, size: 132, stroke: 8, label: 'momentum'),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        const Expanded(child: Rail('Profile complete')),
                        Text('${p.completeness}%',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: c.ink)),
                      ],
                    ),
                    const SizedBox(height: 7),
                    Meter(value: p.completeness, tone: c.caution, height: 5),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              Panel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Rail('Skills the agent scores you on'),
                    const SizedBox(height: 14),
                    Wrap(
                      spacing: 7,
                      runSpacing: 7,
                      children: [
                        for (final s in p.skills.where((s) => !s.emerging))
                          Chip_(s.name, tone: ChipTone.iris),
                      ],
                    ),
                    if (p.skills.any((s) => s.emerging)) ...[
                      const SizedBox(height: 18),
                      const Rail('Emerging — claimed but not yet evidenced'),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 7,
                        runSpacing: 7,
                        children: [
                          for (final s in p.skills.where((s) => s.emerging))
                            Chip_(s.name, tone: ChipTone.caution),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 12),

              Panel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Rail('Momentum inputs'),
                    const SizedBox(height: 16),
                    for (final inp in p.momentum.inputs) ...[
                      Row(
                        children: [
                          Expanded(
                            child: Text(inp.label, style: Theme.of(context).textTheme.bodyMedium),
                          ),
                          Text('${inp.value}',
                              style: TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.w600, color: c.ink)),
                        ],
                      ),
                      const SizedBox(height: 7),
                      Meter(
                        value: inp.value,
                        tone: inp.value >= 88 ? c.positive : c.iris,
                        height: 5,
                      ),
                      const SizedBox(height: 15),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 12),

              Panel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Rail('Preferences'),
                    const SizedBox(height: 14),
                    _Row(label: 'Locations', value: p.locations.join(' · ')),
                    _Row(label: 'Career goals', value: p.goals.join(' · ')),
                    const SizedBox(height: 8),
                    const Rail('Appearance'),
                    const SizedBox(height: 10),
                    SegmentedButton<ThemeModeChoice>(
                      segments: const [
                        ButtonSegment(value: ThemeModeChoice.system, label: Text('System')),
                        ButtonSegment(value: ThemeModeChoice.light, label: Text('Light')),
                        ButtonSegment(value: ThemeModeChoice.dark, label: Text('Dark')),
                      ],
                      selected: {theme},
                      showSelectedIcon: false,
                      onSelectionChanged: (s) =>
                          ref.read(themeModeProvider.notifier).state = s.first,
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

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value});
  final String label, value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Rail(label),
          const SizedBox(height: 4),
          Text(value, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
