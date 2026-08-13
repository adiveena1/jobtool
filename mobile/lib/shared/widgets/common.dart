import 'package:flutter/material.dart';

import '../../core/theme/tokens.dart';

/// The shared widget vocabulary. Every feature composes from these so the two
/// platforms stay visually identical without copying layout code around.

class Panel extends StatelessWidget {
  const Panel({super.key, required this.child, this.padding = const EdgeInsets.all(T.pad), this.color, this.border});

  final Widget child;
  final EdgeInsets padding;
  final Color? color;
  final Color? border;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? c.surface,
        borderRadius: BorderRadius.circular(T.rLg),
        border: Border.all(color: border ?? c.line),
      ),
      child: child,
    );
  }
}

/// Small-caps section label. The organising device across both clients.
class Rail extends StatelessWidget {
  const Rail(this.text, {super.key, this.color});
  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: Theme.of(context).textTheme.labelSmall?.copyWith(color: color),
    );
  }
}

class Chip_ extends StatelessWidget {
  const Chip_(this.label, {super.key, this.tone = ChipTone.neutral, this.icon});

  final String label;
  final ChipTone tone;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final (bg, fg, br) = switch (tone) {
      ChipTone.neutral => (c.surface2, c.ink2, c.line),
      ChipTone.iris => (c.iris.withValues(alpha: 0.10), c.iris, c.iris.withValues(alpha: 0.24)),
      ChipTone.positive => (c.positive.withValues(alpha: 0.11), c.positive, Colors.transparent),
      ChipTone.caution => (c.caution.withValues(alpha: 0.11), c.caution, Colors.transparent),
      ChipTone.critical => (c.critical.withValues(alpha: 0.11), c.critical, Colors.transparent),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(T.rSm),
        border: Border.all(color: br),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 12, color: fg), const SizedBox(width: 5)],
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: fg)),
        ],
      ),
    );
  }
}

enum ChipTone { neutral, iris, positive, caution, critical }

/// Company monogram. Stands in for a logo without pretending to be one.
class Mark extends StatelessWidget {
  const Mark({super.key, required this.text, required this.tint, this.size = 40});

  final String text;
  final Color tint;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: tint.withValues(alpha: 0.13),
        borderRadius: BorderRadius.circular(size * 0.28),
        border: Border.all(color: tint.withValues(alpha: 0.26)),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: size * 0.34, fontWeight: FontWeight.w600, color: tint),
      ),
    );
  }
}

/// Animated linear meter, matching the web `.meter`.
class Meter extends StatelessWidget {
  const Meter({super.key, required this.value, this.tone, this.height = 4});

  final int value;
  final Color? tone;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return ClipRRect(
      borderRadius: BorderRadius.circular(height),
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: (value.clamp(0, 100)) / 100),
        duration: const Duration(milliseconds: 900),
        curve: Curves.easeOutCubic,
        builder: (_, t, __) => LinearProgressIndicator(
          value: t,
          minHeight: height,
          backgroundColor: c.surface2,
          valueColor: AlwaysStoppedAnimation(tone ?? c.iris),
        ),
      ),
    );
  }
}

/// Radial score. The stroke sweeps from twelve o'clock, same as the web Ring.
class Ring extends StatelessWidget {
  const Ring({
    super.key,
    required this.value,
    this.size = 140,
    this.stroke = 8,
    this.tone,
    this.label,
  });

  final int value;
  final double size, stroke;
  final Color? tone;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return SizedBox(
      width: size,
      height: size,
      child: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: value / 100),
        duration: const Duration(milliseconds: 1200),
        curve: Curves.easeOutCubic,
        builder: (context, t, _) => Stack(
          alignment: Alignment.center,
          children: [
            SizedBox.expand(
              child: CircularProgressIndicator(
                value: t,
                strokeWidth: stroke,
                strokeCap: StrokeCap.round,
                backgroundColor: c.surface2,
                valueColor: AlwaysStoppedAnimation(tone ?? c.iris),
              ),
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${(t * 100).round()}',
                  style: TextStyle(
                    fontSize: size * 0.27,
                    fontWeight: FontWeight.w600,
                    height: 1,
                    color: c.ink,
                  ),
                ),
                if (label != null) ...[const SizedBox(height: 4), Rail(label!)],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// The live-agent dot. Its presence always means the same thing.
class Pulse extends StatefulWidget {
  const Pulse({super.key, this.size = 7, this.color});
  final double size;
  final Color? color;

  @override
  State<Pulse> createState() => _PulseState();
}

class _PulseState extends State<Pulse> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2400),
  )..repeat();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? context.c.signal;
    // Respect the platform's reduced-motion setting rather than always animating.
    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
      return _dot(color);
    }
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => SizedBox(
        width: widget.size,
        height: widget.size,
        child: Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            Transform.scale(
              scale: 1 + _ctrl.value * 2.4,
              child: Container(
                decoration: BoxDecoration(
                  color: color.withValues(alpha: (1 - _ctrl.value) * 0.5),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            _dot(color),
          ],
        ),
      ),
    );
  }

  Widget _dot(Color color) => Container(
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      );
}

/* ------------------------------------------------------------- states -- */

class EmptyStateView extends StatelessWidget {
  const EmptyStateView({
    super.key,
    required this.title,
    required this.body,
    this.cta,
    this.onCta,
    this.icon = Icons.auto_awesome_outlined,
  });

  final String title, body;
  final String? cta;
  final VoidCallback? onCta;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 46,
              height: 46,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: c.iris.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(T.rLg),
                border: Border.all(color: c.iris.withValues(alpha: 0.22)),
              ),
              child: Icon(icon, size: 20, color: c.iris),
            ),
            const SizedBox(height: 18),
            Text(title, style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(body, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
            if (cta != null) ...[
              const SizedBox(height: 22),
              FilledButton(onPressed: onCta, child: Text(cta!)),
            ],
          ],
        ),
      ),
    );
  }
}

class ErrorStateView extends StatelessWidget {
  const ErrorStateView({super.key, required this.message, this.onRetry});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline_rounded, size: 30, color: c.critical),
            const SizedBox(height: 14),
            Text('Something went wrong.', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(message, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (onRetry != null) FilledButton(onPressed: onRetry, child: const Text('Try again')),
                const SizedBox(width: 10),
                OutlinedButton(onPressed: () {}, child: const Text('Contact support')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class LoadingRows extends StatelessWidget {
  const LoadingRows({super.key, this.rows = 4});
  final int rows;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Column(
      children: List.generate(
        rows,
        (i) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Panel(
            child: Row(
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: c.surface2, borderRadius: BorderRadius.circular(T.rMd)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(height: 13, width: 150, color: c.surface2),
                      const SizedBox(height: 8),
                      Container(height: 11, width: 90, color: c.surface2),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
