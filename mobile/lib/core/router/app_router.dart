import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/ai_copilot/copilot_page.dart';
import '../../features/applications/applications_page.dart';
import '../../features/dashboard/dashboard_page.dart';
import '../../features/jobs/job_detail_sheet.dart';
import '../../features/jobs/jobs_page.dart';
import '../../features/onboarding/onboarding_page.dart';
import '../../features/profile/profile_page.dart';
import '../../shared/widgets/app_scaffold.dart';

/// GoRouter with a StatefulShellRoute so each tab keeps its own navigation
/// stack and scroll position — the behaviour a native app is expected to have
/// and the reason this is not a WebView.
final appRouter = GoRouter(
  initialLocation: '/home',
  routes: [
    GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingPage()),

    StatefulShellRoute.indexedStack(
      builder: (_, __, shell) => AppScaffold(shell: shell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/home',
            builder: (_, __) => const DashboardPage(),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/jobs',
            builder: (_, __) => const JobsPage(),
            routes: [
              GoRoute(
                path: ':id',
                pageBuilder: (context, state) => ModalBottomSheetPage(
                  child: JobDetailSheet(jobId: state.pathParameters['id']!),
                ),
              ),
            ],
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/applications', builder: (_, __) => const ApplicationsPage()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/ai', builder: (_, __) => const CopilotPage()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (_, __) => const ProfilePage()),
        ]),
      ],
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('That screen does not exist.'),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => context.go('/home'),
              child: const Text('Back to Mission Control'),
            ),
          ],
        ),
      ),
    ),
  ),
);

/// Lets a route render as a native modal sheet rather than a full page push.
class ModalBottomSheetPage extends Page<void> {
  const ModalBottomSheetPage({required this.child, super.key});
  final Widget child;

  @override
  Route<void> createRoute(BuildContext context) => ModalBottomSheetRoute<void>(
        settings: this,
        isScrollControlled: true,
        useSafeArea: true,
        showDragHandle: true,
        builder: (_) => child,
      );
}
