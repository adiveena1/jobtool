import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_result.dart';
import '../../core/network/providers.dart';
import '../../core/theme/tokens.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/common.dart';
import 'job_detail_sheet.dart';

/// The opportunity feed.
///
/// Native gestures, not a scrolling web list: swipe right saves, swipe left
/// skips, tap opens the sheet, long-press asks the agent.
class JobsPage extends ConsumerWidget {
  const JobsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobs = ref.watch(jobsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Discover'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: T.pad),
            child: Row(
              children: [
                const Pulse(size: 6),
                const SizedBox(width: 7),
                Text('41 sources', style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: jobs.when(
          loading: () => const Padding(padding: EdgeInsets.all(T.pad), child: LoadingRows()),
          error: (e, _) => ErrorStateView(
            message: e is ApiError ? e.message : 'We could not load the feed.',
            onRetry: () => ref.invalidate(jobsProvider),
          ),
          data: (list) {
            if (list.isEmpty) {
              return EmptyStateView(
                icon: Icons.search_outlined,
                title: 'No roles yet.',
                body: "The agent is still scanning. New matches land here as they clear your bar.",
                cta: 'Refine my preferences',
                onCta: () => context.go('/profile'),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(jobsProvider);
                await ref.read(jobsProvider.future);
              },
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(T.pad, T.pad, T.pad, 110),
                physics: const AlwaysScrollableScrollPhysics(),
                itemCount: list.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, i) => _SwipeableJob(job: list[i]),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _SwipeableJob extends ConsumerWidget {
  const _SwipeableJob({required this.job});
  final Job job;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final c = context.c;
    final saved = ref.watch(savedJobsProvider).contains(job.id);

    return Dismissible(
      key: ValueKey(job.id),
      // Neither direction destroys anything, so both resolve back to the list.
      confirmDismiss: (dir) async {
        if (dir == DismissDirection.startToEnd) {
          ref.read(savedJobsProvider.notifier).toggle(job.id);
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(SnackBar(
              content: Text(saved ? 'Removed from saved' : 'Saved'),
              behavior: SnackBarBehavior.floating,
            ));
        } else {
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(const SnackBar(
              content: Text('Skipped. The agent will stop surfacing this one.'),
              behavior: SnackBarBehavior.floating,
            ));
        }
        return false;
      },
      background: _SwipeHint(
        alignment: Alignment.centerLeft,
        color: c.positive,
        icon: Icons.bookmark_added_outlined,
        label: 'Save',
      ),
      secondaryBackground: _SwipeHint(
        alignment: Alignment.centerRight,
        color: c.ink3,
        icon: Icons.visibility_off_outlined,
        label: 'Skip',
      ),
      child: _JobCard(job: job, saved: saved),
    );
  }
}

class _SwipeHint extends StatelessWidget {
  const _SwipeHint({
    required this.alignment,
    required this.color,
    required this.icon,
    required this.label,
  });

  final Alignment alignment;
  final Color color;
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: alignment,
      padding: const EdgeInsets.symmetric(horizontal: 22),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(T.rLg),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 19),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 13.5)),
        ],
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({required this.job, required this.saved});
  final Job job;
  final bool saved;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final m = job.match;
    final tone = (m?.overall ?? 0) >= 95
        ? c.positive
        : (m?.overall ?? 0) >= 85
            ? c.iris
            : c.caution;

    return Semantics(
      button: true,
      label: '${job.role} at ${job.companyName}, ${m?.overall ?? 0} percent match',
      child: InkWell(
        borderRadius: BorderRadius.circular(T.rLg),
        onTap: () => context.go('/jobs/${job.id}'),
        onLongPress: () => showModalBottomSheet<void>(
          context: context,
          isScrollControlled: true,
          useSafeArea: true,
          builder: (_) => JobDetailSheet(jobId: job.id, startOnExplain: true),
        ),
        child: Panel(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Mark(text: job.companyMonogram, tint: job.companyTint, size: 42),
                  const SizedBox(width: 13),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(job.role,
                            style: Theme.of(context).textTheme.titleMedium,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 3),
                        Text('${job.companyName} · ${job.location} · ${job.freshness}',
                            style: Theme.of(context).textTheme.bodySmall,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('${m?.overall ?? 0}%',
                          style: TextStyle(
                              fontSize: 24, fontWeight: FontWeight.w600, height: 1, color: tone)),
                      const SizedBox(height: 3),
                      const Rail('match'),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 13),
              Row(
                children: [
                  Text(job.salaryRange,
                      style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: c.ink)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(job.remote,
                        style: Theme.of(context).textTheme.bodySmall,
                        overflow: TextOverflow.ellipsis),
                  ),
                  if (saved) Icon(Icons.bookmark_rounded, size: 17, color: c.positive),
                ],
              ),
              if (m != null) ...[
                const SizedBox(height: 12),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    for (final s in m.strengths.take(3))
                      Chip_(s, tone: ChipTone.positive, icon: Icons.check_rounded),
                    for (final g in m.gaps.take(1))
                      Chip_(g, tone: ChipTone.caution, icon: Icons.change_history_rounded),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
