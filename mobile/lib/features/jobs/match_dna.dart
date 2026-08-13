import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../core/theme/tokens.dart';
import '../../shared/models/models.dart';

/// Match DNA — the same radial map the website draws, rendered natively.
///
/// A percentage collapses eight judgements into one number and hides which is
/// weak. The polygon's shape is the argument; the number is only its summary.
class MatchDna extends StatefulWidget {
  const MatchDna({super.key, required this.facets, this.size = 280});

  final List<MatchFacet> facets;
  final double size;

  @override
  State<MatchDna> createState() => _MatchDnaState();
}

class _MatchDnaState extends State<MatchDna> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1100),
  );

  @override
  void initState() {
    super.initState();
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return Semantics(
      label: widget.facets.map((f) => '${f.label} ${f.score} percent').join(', '),
      child: SizedBox(
        width: widget.size,
        height: widget.size,
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (_, __) => CustomPaint(
            painter: _DnaPainter(
              facets: widget.facets,
              progress: reduced ? 1 : Curves.easeOutCubic.transform(_ctrl.value),
              line: c.line,
              iris: c.iris,
              ink: c.ink,
              ink3: c.ink3,
              surface: c.surface,
            ),
          ),
        ),
      ),
    );
  }
}

class _DnaPainter extends CustomPainter {
  _DnaPainter({
    required this.facets,
    required this.progress,
    required this.line,
    required this.iris,
    required this.ink,
    required this.ink3,
    required this.surface,
  });

  final List<MatchFacet> facets;
  final double progress;
  final Color line, iris, ink, ink3, surface;

  @override
  void paint(Canvas canvas, Size size) {
    if (facets.isEmpty) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 44;
    final n = facets.length;

    Offset at(int i, double r) {
      final a = (math.pi * 2 * i) / n - math.pi / 2;
      return center + Offset(math.cos(a) * r, math.sin(a) * r);
    }

    final grid = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..color = line;

    // Reference rings at 25/50/75/100.
    for (final t in const [0.25, 0.5, 0.75, 1.0]) {
      final p = Path();
      for (var i = 0; i < n; i++) {
        final o = at(i, radius * t);
        i == 0 ? p.moveTo(o.dx, o.dy) : p.lineTo(o.dx, o.dy);
      }
      canvas.drawPath(p..close(), grid);
    }

    for (var i = 0; i < n; i++) {
      canvas.drawLine(center, at(i, radius), grid);
    }

    // The shape itself.
    final shape = Path();
    for (var i = 0; i < n; i++) {
      final o = at(i, radius * (facets[i].score / 100) * progress);
      i == 0 ? shape.moveTo(o.dx, o.dy) : shape.lineTo(o.dx, o.dy);
    }
    shape.close();

    canvas.drawPath(shape, Paint()..color = iris.withValues(alpha: 0.14));
    canvas.drawPath(
      shape,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.8
        ..strokeJoin = StrokeJoin.round
        ..color = iris,
    );

    for (var i = 0; i < n; i++) {
      final o = at(i, radius * (facets[i].score / 100) * progress);
      canvas.drawCircle(o, 3.4, Paint()..color = surface);
      canvas.drawCircle(
        o, 3.4,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.8
          ..color = iris,
      );
    }

    // Axis labels, drawn outside the outermost ring.
    for (var i = 0; i < n; i++) {
      final o = at(i, radius + 24);

      void label(String text, double dy, TextStyle style) {
        final tp = TextPainter(
          text: TextSpan(text: text, style: style),
          textDirection: TextDirection.ltr,
          textAlign: TextAlign.center,
        )..layout();
        tp.paint(canvas, Offset(o.dx - tp.width / 2, o.dy + dy - tp.height / 2));
      }

      label(facets[i].label, -6,
          TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: ink3, letterSpacing: 0.3));
      label('${facets[i].score}', 7,
          TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: ink));
    }
  }

  @override
  bool shouldRepaint(_DnaPainter old) =>
      old.progress != progress || old.facets != facets || old.iris != iris;
}
