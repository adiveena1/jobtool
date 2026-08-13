import 'package:flutter/material.dart';

/// CAREER OS — DESIGN TOKENS
///
/// These are the same values as web/src/styles/globals.css. When a token
/// changes there it changes here; that is what keeps one design language
/// across two codebases rather than two products that merely rhyme.
class T {
  const T._();

  // ---- light ----
  static const canvasLight = Color(0xFFFBFBF9);
  static const surfaceLight = Color(0xFFFFFFFF);
  static const surface2Light = Color(0xFFF5F5F2);
  static const inkLight = Color(0xFF15151A);
  static const ink2Light = Color(0xFF55555F);
  static const ink3Light = Color(0xFF8A8A94);
  static const lineLight = Color(0x1714141A);
  static const line2Light = Color(0x2914141A);
  static const irisLight = Color(0xFF5B47FF);
  static const signalLight = Color(0xFF9BD40B);

  // ---- dark: deep charcoal, never pure black ----
  static const canvasDark = Color(0xFF0D0D10);
  static const surfaceDark = Color(0xFF141419);
  static const surface2Dark = Color(0xFF1B1B22);
  static const inkDark = Color(0xFFF0F0F2);
  static const ink2Dark = Color(0xFFA0A0AC);
  static const ink3Dark = Color(0xFF6E6E7A);
  static const lineDark = Color(0x14FFFFFF);
  static const line2Dark = Color(0x26FFFFFF);
  static const irisDark = Color(0xFF8B7BFF);
  static const signalDark = Color(0xFFC6F03C);

  // ---- shared semantics ----
  static const positive = Color(0xFF12855B);
  static const positiveDark = Color(0xFF3DD68C);
  static const caution = Color(0xFFA66A00);
  static const cautionDark = Color(0xFFE8B33D);
  static const critical = Color(0xFFC2373B);
  static const criticalDark = Color(0xFFF2686C);

  // ---- geometry ----
  static const rXs = 6.0;
  static const rSm = 8.0;
  static const rMd = 10.0;
  static const rLg = 14.0;
  static const rXl = 18.0;

  static const gap = 16.0;
  static const pad = 20.0;
}

/// Semantic colours resolved for the active brightness. Widgets read this
/// instead of reaching for a raw constant, so dark mode is never a special case.
@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.canvas,
    required this.surface,
    required this.surface2,
    required this.ink,
    required this.ink2,
    required this.ink3,
    required this.line,
    required this.line2,
    required this.iris,
    required this.signal,
    required this.positive,
    required this.caution,
    required this.critical,
  });

  final Color canvas, surface, surface2;
  final Color ink, ink2, ink3;
  final Color line, line2;
  final Color iris, signal, positive, caution, critical;

  static const light = AppColors(
    canvas: T.canvasLight, surface: T.surfaceLight, surface2: T.surface2Light,
    ink: T.inkLight, ink2: T.ink2Light, ink3: T.ink3Light,
    line: T.lineLight, line2: T.line2Light,
    iris: T.irisLight, signal: T.signalLight,
    positive: T.positive, caution: T.caution, critical: T.critical,
  );

  static const dark = AppColors(
    canvas: T.canvasDark, surface: T.surfaceDark, surface2: T.surface2Dark,
    ink: T.inkDark, ink2: T.ink2Dark, ink3: T.ink3Dark,
    line: T.lineDark, line2: T.line2Dark,
    iris: T.irisDark, signal: T.signalDark,
    positive: T.positiveDark, caution: T.cautionDark, critical: T.criticalDark,
  );

  @override
  AppColors copyWith({
    Color? canvas, Color? surface, Color? surface2,
    Color? ink, Color? ink2, Color? ink3,
    Color? line, Color? line2,
    Color? iris, Color? signal, Color? positive, Color? caution, Color? critical,
  }) {
    return AppColors(
      canvas: canvas ?? this.canvas,
      surface: surface ?? this.surface,
      surface2: surface2 ?? this.surface2,
      ink: ink ?? this.ink,
      ink2: ink2 ?? this.ink2,
      ink3: ink3 ?? this.ink3,
      line: line ?? this.line,
      line2: line2 ?? this.line2,
      iris: iris ?? this.iris,
      signal: signal ?? this.signal,
      positive: positive ?? this.positive,
      caution: caution ?? this.caution,
      critical: critical ?? this.critical,
    );
  }

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) {
    if (other is! AppColors) return this;
    return AppColors(
      canvas: Color.lerp(canvas, other.canvas, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surface2: Color.lerp(surface2, other.surface2, t)!,
      ink: Color.lerp(ink, other.ink, t)!,
      ink2: Color.lerp(ink2, other.ink2, t)!,
      ink3: Color.lerp(ink3, other.ink3, t)!,
      line: Color.lerp(line, other.line, t)!,
      line2: Color.lerp(line2, other.line2, t)!,
      iris: Color.lerp(iris, other.iris, t)!,
      signal: Color.lerp(signal, other.signal, t)!,
      positive: Color.lerp(positive, other.positive, t)!,
      caution: Color.lerp(caution, other.caution, t)!,
      critical: Color.lerp(critical, other.critical, t)!,
    );
  }
}

extension AppColorsX on BuildContext {
  AppColors get c => Theme.of(this).extension<AppColors>()!;
}
