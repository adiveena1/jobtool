import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/providers.dart';
import '../../core/theme/tokens.dart';
import '../../shared/models/models.dart';
import '../../shared/widgets/common.dart';
import 'match_dna.dart';

/// Job detail as a native bottom sheet, with the agent's full reasoning behind
/// a second tab rather than a second screen.
class JobDetailSheet extends ConsumerWidget {
  const JobDetailSheet({super.key, required this.jobId, this.startOnExplain = false});

  final String jobId;
  final bool startOnExplain;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobs = ref.watch(jobsProvider);

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.88,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) => jobs.when(
        loading: () => const Padding(padding: EdgeInsets.all(T.pad), child: LoadingRows(rows: 3)),
        error: (_, __) => ErrorStateView(
          message: 'We could not load this role.',
          onRetry: () => ref.invalidate(jobsProvider),
        ),
        data: (list) {
          final job = list.where((j) => j.id == jobId).firstOrNull;
          if (job == null) {
            return const EmptyStateView(
              title: 'That role is gone.',
              body: 'It was filled or withdrawn while you were looking.',
            );
          }
          return _Body(job: job, controller: scrollController, startOnExplain: startOnExplain);
        },
      ),
    );
  }
}

class _Body extends ConsumerStatefulWidget {
  const _Body({required this.job, required this.controller, required this.startOnExplain});

  final Job job;
  final ScrollController controller;
  final bool startOnExplain;

  @override
  ConsumerState<_Body> createState() => _BodyState();
}

class _BodyState extends ConsumerState<_Body> {
  late bool _explain = widget.startOnExplain;
  bool _applying = false;

  Future<void> _apply() async {
    setState(() => _applying = true);
    final res = await ref.read(repositoryProvider).apply(widget.job.id);
    if (!mounted) return;
    setState(() => _applying = false);

    res.when(
      success: (_, __) {
        ref.invalidate(applicationsProvider);
        Navigator.of(context).maybePop();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Queued. The agent is tailoring your resume now.'),
          behavior: SnackBarBehavior.floating,
        ));
      },
      // The server's message is written to be read by a person, so it is shown
      // exactly as sent rather than replaced with a generic string.
      failure: (e) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(e.message),
        behavior: SnackBarBehavior.floating,
      )),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final job = widget.job;
    final m = job.match;

    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: widget.controller,
            padding: const EdgeInsets.fromLTRB(T.pad, 4, T.pad, T.pad),
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Mark(text: job.companyMonogram, tint: job.companyTint, size: 46),
                  const SizedBox(width: 13),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(job.role, style: Theme.of(context).textTheme.headlineMedium),
                        const SizedBox(height: 4),
                        Text('${job.companyName} · ${job.location}',
                            style: Theme.of(context).textTheme.bodyMedium),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 7,
                runSpacing: 7,
                children: [
                  Chip_(job.salaryRange, tone: ChipTone.iris),
                  Chip_(job.remote),
                  Chip_(job.experienceRange),
                  Chip_('Posted ${job.freshness}'),
                ],
              ),

              const SizedBox(height: 20),
              SegmentedButton<bool>(
                segments: const [
                  ButtonSegment(value: false, label: Text('Overview')),
                  ButtonSegment(value: true, label: Text('Why apply?')),
                ],
                selected: {_explain},
                onSelectionChanged: (s) => setState(() => _explain = s.first),
                showSelectedIcon: false,
              ),
              const SizedBox(height: 18),

              if (m != null) ...[
                if (!_explain) ...[
                  Center(child: MatchDna(facets: m.facets, size: 280)),
                  const SizedBox(height: 20),
                  for (final f in m.facets) ...[
                    Row(
                      children: [
                        Expanded(child: Text(f.label, style: Theme.of(context).textTheme.bodyMedium)),
                        Text('${f.score}',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: c.ink)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Meter(
                      value: f.score,
                      tone: f.score >= 90 ? c.positive : (f.score >= 75 ? c.iris : c.caution),
                    ),
                    const SizedBox(height: 13),
                  ],
                ] else ...[
                  _Block(
                    title: 'Why it fits',
                    body: '${m.facets.where((f) => f.score >= 90).map((f) => f.label).join(", ")} '
                        'all score above 90. Your ${m.strengths.take(2).join(" and ")} map directly '
                        'onto the first two requirements.',
                  ),
                  _Block(
                    title: 'What is missing',
                    body: m.gaps.isEmpty
                        ? 'Nothing material. Every stated requirement appears in your profile.'
                        : '${m.gaps.join(", ")}. Named in the description but absent from your '
                            'resume — it is the thing an interviewer will probe.',
                  ),
                  _Block(
                    title: 'Competition',
                    body: '${m.competition} — about ${m.applicantCount} applicants so far.'
                        '${m.competition == "High" ? " Tailor before sending; a generic resume will not clear this pile." : ""}',
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Rail('Estimated application strength'),
                        const SizedBox(height: 8),
                        Meter(value: m.overall - 6, height: 5),
                        const SizedBox(height: 6),
                        Text(
                          '${m.overall - 6}% as your resume stands. Tailoring adds roughly 8 points.',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],

                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: c.iris.withValues(alpha: 0.09),
                    borderRadius: BorderRadius.circular(T.rMd),
                    border: Border.all(color: c.iris.withValues(alpha: 0.22)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Rail('Agent recommendation'),
                      const SizedBox(height: 8),
                      Text(m.recommendation,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: c.ink)),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),

        Container(
          padding: EdgeInsets.fromLTRB(
            T.pad, 12, T.pad, 12 + MediaQuery.of(context).padding.bottom,
          ),
          decoration: BoxDecoration(
            color: c.surface,
            border: Border(top: BorderSide(color: c.line)),
          ),
          child: Row(
            children: [
              Expanded(
                child: FilledButton(
                  onPressed: _applying ? null : _apply,
                  child: _applying
                      ? const SizedBox(
                          width: 18, height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                        )
                      : const Text('Apply with AI'),
                ),
              ),
              const SizedBox(width: 10),
              OutlinedButton(
                onPressed: () => ref.read(savedJobsProvider.notifier).toggle(job.id),
                child: const Text('Save'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Block extends StatelessWidget {
  const _Block({required this.title, required this.body});
  final String title, body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: context.c.ink)),
          const SizedBox(height: 5),
          Text(body, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
