import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/providers.dart';
import '../../core/theme/tokens.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/common.dart';

class ApplicationsPage extends ConsumerStatefulWidget {
  const ApplicationsPage({super.key});

  @override
  ConsumerState<ApplicationsPage> createState() => _ApplicationsPageState();
}

class _ApplicationsPageState extends ConsumerState<ApplicationsPage> {
  Stage? _filter;

  Color _tone(BuildContext context, Stage s) {
    final c = context.c;
    return switch (s) {
      Stage.saved || Stage.discovered => c.ink3,
      Stage.preparing => c.caution,
      Stage.applied || Stage.screening => c.iris,
      Stage.interview || Stage.offer => c.positive,
      Stage.rejected => c.critical,
    };
  }

  @override
  Widget build(BuildContext context) {
    final apps = ref.watch(applicationsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pipeline')),
      body: SafeArea(
        top: false,
        child: apps.when(
          loading: () => const Padding(padding: EdgeInsets.all(T.pad), child: LoadingRows()),
          error: (_, __) => ErrorStateView(
            message: 'We could not load your pipeline.',
            onRetry: () => ref.invalidate(applicationsProvider),
          ),
          data: (all) {
            if (all.isEmpty) {
              return EmptyStateView(
                icon: Icons.layers_outlined,
                title: 'Your career pipeline is empty.',
                body: 'Nothing tracked yet. The feed has 31 roles above your bar right now.',
                cta: 'Find your first opportunity',
                onCta: () => context.go('/jobs'),
              );
            }

            final rows = _filter == null ? all : all.where((a) => a.stage == _filter).toList();
            final counts = <Stage, int>{};
            for (final a in all) {
              counts[a.stage] = (counts[a.stage] ?? 0) + 1;
            }

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(applicationsProvider);
                await ref.read(applicationsProvider.future);
              },
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(T.pad, 4, T.pad, 14),
                      child: _Stats(total: all.length),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 40,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: T.pad),
                        children: [
                          _Filter(
                            label: 'All ${all.length}',
                            on: _filter == null,
                            onTap: () => setState(() => _filter = null),
                          ),
                          for (final s in Stage.values)
                            if ((counts[s] ?? 0) > 0)
                              _Filter(
                                label: '${s.label} ${counts[s]}',
                                on: _filter == s,
                                onTap: () => setState(() => _filter = s),
                              ),
                        ],
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(T.pad, 14, T.pad, 110),
                    sliver: SliverList.separated(
                      itemCount: rows.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) {
                        final a = rows[i];
                        return InkWell(
                          borderRadius: BorderRadius.circular(T.rLg),
                          onTap: () => _openDetail(a),
                          child: Panel(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                Mark(text: a.companyMonogram, tint: a.companyTint, size: 38),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(a.role,
                                          style: Theme.of(context).textTheme.titleMedium
                                              ?.copyWith(fontSize: 14.5),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis),
                                      const SizedBox(height: 2),
                                      Text('${a.companyName} · ${a.salaryRange}',
                                          style: Theme.of(context).textTheme.bodySmall,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: _tone(context, a.stage).withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(T.rSm),
                                  ),
                                  child: Text(
                                    a.stage.label,
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w600,
                                      color: _tone(context, a.stage),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  void _openDetail(Application a) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        maxChildSize: 0.92,
        builder: (context, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(T.pad, 4, T.pad, 32),
          children: [
            Row(
              children: [
                Mark(text: a.companyMonogram, tint: a.companyTint, size: 44),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(a.role, style: Theme.of(context).textTheme.headlineMedium),
                      const SizedBox(height: 3),
                      Text(a.companyName, style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),
            for (final row in [
              ('Stage', a.stage.label),
              ('Salary', a.salaryRange),
              ('Applied', a.appliedAt ?? '—'),
              ('Resume used', a.resumeLabel),
              ('Recruiter', a.recruiter ?? '—'),
              ('Interview', a.interviewAt ?? '—'),
            ]) ...[
              Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(width: 118, child: Rail(row.$1)),
                    Expanded(
                      child: Text(row.$2, style: Theme.of(context).textTheme.bodyMedium),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 6),
            const Rail('Notes'),
            const SizedBox(height: 7),
            Text(a.note, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 22),
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: context.c.iris.withValues(alpha: 0.09),
                borderRadius: BorderRadius.circular(T.rMd),
                border: Border.all(color: context.c.iris.withValues(alpha: 0.22)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Rail('Agent recommendation'),
                  const SizedBox(height: 8),
                  Text(
                    switch (a.stage) {
                      Stage.interview =>
                        'Run one system-design round before this panel. It is the only axis where you scored under 90 for this role.',
                      Stage.offer =>
                        'This sits below the band for your level in this city. Ask for the top of the range with the growth data attached.',
                      Stage.rejected =>
                        'Third rejection on this resume version. Retire it and re-send the tailored one to the still-open roles.',
                      _ =>
                        'Approve the tailored resume and this goes out today. The posting is closing shortly.',
                    },
                    style: Theme.of(context).textTheme.bodyMedium
                        ?.copyWith(color: context.c.ink),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            FilledButton(onPressed: () => Navigator.pop(context), child: const Text('Move stage')),
          ],
        ),
      ),
    );
  }
}

class _Stats extends StatelessWidget {
  const _Stats({required this.total});
  final int total;

  @override
  Widget build(BuildContext context) {
    const stats = [
      ('Applications', '124'),
      ('Responses', '19'),
      ('Interviews', '8'),
      ('Response rate', '15.3%'),
    ];

    return Row(
      children: [
        for (final s in stats) ...[
          Expanded(
            child: Panel(
              padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s.$2,
                      style: TextStyle(
                          fontSize: 19, fontWeight: FontWeight.w600, height: 1, color: context.c.ink)),
                  const SizedBox(height: 6),
                  Text(s.$1,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 10.5),
                      maxLines: 2),
                ],
              ),
            ),
          ),
          if (s != stats.last) const SizedBox(width: 8),
        ],
      ],
    );
  }
}

class _Filter extends StatelessWidget {
  const _Filter({required this.label, required this.on, required this.onTap});
  final String label;
  final bool on;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Semantics(
        selected: on,
        button: true,
        child: InkWell(
          borderRadius: BorderRadius.circular(T.rSm),
          onTap: onTap,
          child: Container(
            alignment: Alignment.center,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: on ? c.iris.withValues(alpha: 0.11) : c.surface2,
              borderRadius: BorderRadius.circular(T.rSm),
              border: Border.all(color: on ? c.iris.withValues(alpha: 0.28) : c.line),
            ),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w500,
                color: on ? c.iris : c.ink2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
