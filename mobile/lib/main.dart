import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/network/providers.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: CareerOsApp()));
}

class CareerOsApp extends ConsumerWidget {
  const CareerOsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final choice = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'Career OS',
      debugShowCheckedModeBanner: false,
      routerConfig: appRouter,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: switch (choice) {
        ThemeModeChoice.system => ThemeMode.system,
        ThemeModeChoice.light => ThemeMode.light,
        ThemeModeChoice.dark => ThemeMode.dark,
      },
      builder: (context, child) {
        // Honour the OS text-size setting, but stop layouts breaking past 1.6x.
        final media = MediaQuery.of(context);
        return MediaQuery(
          data: media.copyWith(
            textScaler: media.textScaler.clamp(minScaleFactor: 0.9, maxScaleFactor: 1.6),
          ),
          child: child!,
        );
      },
    );
  }
}
