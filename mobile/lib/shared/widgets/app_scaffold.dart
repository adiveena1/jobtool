import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/tokens.dart';

/// The five destinations. The agent is one of them, never buried behind a menu.
class AppScaffold extends StatelessWidget {
  const AppScaffold({super.key, required this.shell});

  final StatefulNavigationShell shell;

  static const _destinations = [
    (icon: Icons.home_outlined, active: Icons.home_rounded, label: 'Home'),
    (icon: Icons.search_outlined, active: Icons.search_rounded, label: 'Jobs'),
    (icon: Icons.layers_outlined, active: Icons.layers_rounded, label: 'Pipeline'),
    (icon: Icons.auto_awesome_outlined, active: Icons.auto_awesome_rounded, label: 'AI'),
    (icon: Icons.person_outline_rounded, active: Icons.person_rounded, label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.c;

    return Scaffold(
      body: shell,
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(border: Border(top: BorderSide(color: c.line))),
        child: NavigationBar(
          selectedIndex: shell.currentIndex,
          onDestinationSelected: (i) => shell.goBranch(i, initialLocation: i == shell.currentIndex),
          destinations: [
            for (final d in _destinations)
              NavigationDestination(
                icon: Icon(d.icon, color: c.ink3),
                selectedIcon: Icon(d.active, color: c.iris),
                label: d.label,
                tooltip: d.label,
              ),
          ],
        ),
      ),
      // The copilot stays reachable from every tab except its own.
      floatingActionButton: shell.currentIndex == 3
          ? null
          : FloatingActionButton.extended(
              onPressed: () => context.go('/ai'),
              backgroundColor: c.ink,
              foregroundColor: c.canvas,
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(T.rLg)),
              icon: Container(
                width: 7, height: 7,
                decoration: BoxDecoration(color: c.signal, shape: BoxShape.circle),
              ),
              label: const Text('Copilot', style: TextStyle(fontWeight: FontWeight.w600)),
            ),
    );
  }
}
