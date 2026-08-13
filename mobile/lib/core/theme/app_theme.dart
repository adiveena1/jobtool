import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'tokens.dart';

/// Material 3, retuned to the Career OS language: flat surfaces, hairline
/// borders, one accent. The defaults are overridden rather than accepted so the
/// app does not read as stock Material.
class AppTheme {
  const AppTheme._();

  static ThemeData light() => _build(Brightness.light, AppColors.light);
  static ThemeData dark() => _build(Brightness.dark, AppColors.dark);

  static ThemeData _build(Brightness b, AppColors c) {
    final base = ThemeData(useMaterial3: true, brightness: b);

    final text = GoogleFonts.interTextTheme(base.textTheme).apply(
      bodyColor: c.ink,
      displayColor: c.ink,
    );

    return base.copyWith(
      scaffoldBackgroundColor: c.canvas,
      canvasColor: c.canvas,
      extensions: [c],
      colorScheme: ColorScheme.fromSeed(
        seedColor: c.iris,
        brightness: b,
      ).copyWith(
        primary: c.iris,
        surface: c.surface,
        error: c.critical,
      ),
      textTheme: text.copyWith(
        displayLarge: GoogleFonts.inter(
          fontSize: 40, fontWeight: FontWeight.w600, height: 1.02,
          letterSpacing: -1.4, color: c.ink,
        ),
        headlineMedium: GoogleFonts.inter(
          fontSize: 26, fontWeight: FontWeight.w600, height: 1.12,
          letterSpacing: -0.7, color: c.ink,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: -0.2, color: c.ink,
        ),
        bodyMedium: GoogleFonts.inter(fontSize: 14.5, height: 1.55, color: c.ink2),
        bodySmall: GoogleFonts.inter(fontSize: 12.5, height: 1.45, color: c.ink3),
        labelSmall: GoogleFonts.inter(
          fontSize: 10.5, fontWeight: FontWeight.w600,
          letterSpacing: 1.5, color: c.ink3,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: c.canvas,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: -0.2, color: c.ink,
        ),
        iconTheme: IconThemeData(color: c.ink2, size: 21),
      ),
      cardTheme: CardThemeData(
        color: c.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(T.rLg),
          side: BorderSide(color: c.line),
        ),
      ),
      dividerTheme: DividerThemeData(color: c.line, thickness: 1, space: 1),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: c.iris,
          foregroundColor: b == Brightness.dark ? T.canvasDark : Colors.white,
          minimumSize: const Size(0, 46),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(T.rMd)),
          textStyle: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: c.ink,
          minimumSize: const Size(0, 46),
          side: BorderSide(color: c.line2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(T.rMd)),
          textStyle: GoogleFonts.inter(fontSize: 14.5, fontWeight: FontWeight.w600),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: c.surface,
        surfaceTintColor: Colors.transparent,
        indicatorColor: c.iris.withValues(alpha: 0.12),
        height: 66,
        elevation: 0,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        labelTextStyle: WidgetStatePropertyAll(
          GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500, color: c.ink3),
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: c.surface,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c.surface2,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(T.rMd),
          borderSide: BorderSide(color: c.line2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(T.rMd),
          borderSide: BorderSide(color: c.line2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(T.rMd),
          borderSide: BorderSide(color: c.iris, width: 1.6),
        ),
        hintStyle: GoogleFonts.inter(fontSize: 14, color: c.ink3),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: c.iris,
        linearTrackColor: c.surface2,
        linearMinHeight: 4,
      ),
      splashFactory: InkSparkle.splashFactory,
    );
  }
}
