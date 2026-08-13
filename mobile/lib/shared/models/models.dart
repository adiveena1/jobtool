import 'package:flutter/material.dart';

/// Dart mirror of web/src/types/api.ts.
///
/// Field names match the JSON exactly. When the contract changes on the web
/// side it changes here in the same commit — that is the whole discipline that
/// keeps one backend serving two clients.

int _int(Object? v, [int fallback = 0]) =>
    v is int ? v : (v is num ? v.toInt() : int.tryParse('$v') ?? fallback);

double _double(Object? v, [double fallback = 0]) =>
    v is num ? v.toDouble() : double.tryParse('$v') ?? fallback;

String _str(Object? v, [String fallback = '']) => v is String ? v : fallback;

List<String> _strList(Object? v) =>
    v is List ? v.map((e) => e.toString()).toList(growable: false) : const [];

Color _tint(Object? v) {
  final raw = _str(v).replaceFirst('#', '');
  final parsed = int.tryParse(raw, radix: 16);
  return parsed == null ? const Color(0xFF5B47FF) : Color(0xFF000000 | parsed);
}

/* ------------------------------------------------------------------ job -- */

class MatchFacet {
  const MatchFacet({required this.key, required this.label, required this.score});

  final String key;
  final String label;
  final int score;

  factory MatchFacet.fromJson(Map<String, dynamic> j) => MatchFacet(
        key: _str(j['key']),
        label: _str(j['label']),
        score: _int(j['score']),
      );
}

class JobMatch {
  const JobMatch({
    required this.overall,
    required this.facets,
    required this.strengths,
    required this.gaps,
    required this.recommendation,
    required this.competition,
    required this.applicantCount,
    this.applyWithinHours,
  });

  final int overall;
  final List<MatchFacet> facets;
  final List<String> strengths;
  final List<String> gaps;
  final String recommendation;
  final String competition;
  final int applicantCount;
  final int? applyWithinHours;

  factory JobMatch.fromJson(Map<String, dynamic> j) => JobMatch(
        overall: _int(j['overall']),
        facets: (j['facets'] as List? ?? const [])
            .map((e) => MatchFacet.fromJson(e as Map<String, dynamic>))
            .toList(growable: false),
        strengths: _strList(j['strengths']),
        gaps: _strList(j['gaps']),
        recommendation: _str(j['recommendation']),
        competition: _str(j['competition'], 'Moderate'),
        applicantCount: _int(j['applicantCount']),
        applyWithinHours: j['applyWithinHours'] == null ? null : _int(j['applyWithinHours']),
      );
}

class Job {
  const Job({
    required this.id,
    required this.role,
    required this.companyName,
    required this.companyMonogram,
    required this.companyTint,
    required this.location,
    required this.remote,
    required this.salaryRange,
    required this.experienceRange,
    required this.postedAt,
    this.match,
  });

  final String id, role, companyName, companyMonogram;
  final Color companyTint;
  final String location, remote, salaryRange, experienceRange;
  final DateTime postedAt;
  final JobMatch? match;

  String get freshness {
    final h = DateTime.now().difference(postedAt).inHours;
    if (h < 1) return 'just now';
    if (h < 24) return '${h}h ago';
    return '${(h / 24).round()}d ago';
  }

  factory Job.fromJson(Map<String, dynamic> j) => Job(
        id: _str(j['id']),
        role: _str(j['role']),
        companyName: _str(j['companyName']),
        companyMonogram: _str(j['companyMonogram']),
        companyTint: _tint(j['companyTint']),
        location: _str(j['location']),
        remote: _str(j['remote']),
        salaryRange: _str(j['salaryRange']),
        experienceRange: _str(j['experienceRange']),
        postedAt: DateTime.tryParse(_str(j['postedAt'])) ?? DateTime.now(),
        match: j['match'] == null ? null : JobMatch.fromJson(j['match'] as Map<String, dynamic>),
      );
}

/* ---------------------------------------------------------- application -- */

enum Stage {
  discovered, saved, preparing, applied, screening, interview, offer, rejected;

  static Stage parse(String? raw) =>
      Stage.values.firstWhere((s) => s.name == raw, orElse: () => Stage.applied);

  String get label => switch (this) {
        Stage.discovered => 'Discovered',
        Stage.saved => 'Saved',
        Stage.preparing => 'Preparing',
        Stage.applied => 'Applied',
        Stage.screening => 'Screening',
        Stage.interview => 'Interview',
        Stage.offer => 'Offer',
        Stage.rejected => 'Rejected',
      };
}

class Application {
  const Application({
    required this.id,
    required this.role,
    required this.companyName,
    required this.companyMonogram,
    required this.companyTint,
    required this.stage,
    required this.salaryRange,
    required this.resumeLabel,
    required this.note,
    this.appliedAt,
    this.recruiter,
    this.interviewAt,
  });

  final String id, role, companyName, companyMonogram;
  final Color companyTint;
  final Stage stage;
  final String salaryRange, resumeLabel, note;
  final String? appliedAt, recruiter, interviewAt;

  factory Application.fromJson(Map<String, dynamic> j) => Application(
        id: _str(j['id']),
        role: _str(j['role']),
        companyName: _str(j['companyName']),
        companyMonogram: _str(j['companyMonogram']),
        companyTint: _tint(j['companyTint']),
        stage: Stage.parse(j['stage'] as String?),
        salaryRange: _str(j['salaryRange']),
        resumeLabel: _str(j['resumeLabel'], '—'),
        note: _str(j['note']),
        appliedAt: j['appliedAt'] as String?,
        recruiter: j['recruiter'] as String?,
        interviewAt: j['interviewAt'] as String?,
      );
}

/* -------------------------------------------------------------- profile -- */

class MomentumInput {
  const MomentumInput({required this.label, required this.value, required this.weight});
  final String label;
  final int value;
  final double weight;

  factory MomentumInput.fromJson(Map<String, dynamic> j) => MomentumInput(
        label: _str(j['label']),
        value: _int(j['value']),
        weight: _double(j['weight']),
      );
}

class Momentum {
  const Momentum({
    required this.value,
    required this.deltaWeek,
    required this.nextMilestone,
    required this.inputs,
  });

  final int value, deltaWeek, nextMilestone;
  final List<MomentumInput> inputs;

  factory Momentum.fromJson(Map<String, dynamic> j) => Momentum(
        value: _int(j['value']),
        deltaWeek: _int(j['deltaWeek']),
        nextMilestone: _int(j['nextMilestone']),
        inputs: (j['inputs'] as List? ?? const [])
            .map((e) => MomentumInput.fromJson(e as Map<String, dynamic>))
            .toList(growable: false),
      );
}

class Skill {
  const Skill({required this.name, required this.level, required this.demand, required this.emerging});
  final String name;
  final int level, demand;
  final bool emerging;

  factory Skill.fromJson(Map<String, dynamic> j) => Skill(
        name: _str(j['name']),
        level: _int(j['level']),
        demand: _int(j['demand']),
        emerging: j['emerging'] == true,
      );
}

class CareerProfile {
  const CareerProfile({
    required this.title,
    required this.yearsExperience,
    required this.skills,
    required this.locations,
    required this.goals,
    required this.momentum,
    required this.completeness,
  });

  final String title;
  final int yearsExperience;
  final List<Skill> skills;
  final List<String> locations, goals;
  final Momentum momentum;
  final int completeness;

  factory CareerProfile.fromJson(Map<String, dynamic> j) => CareerProfile(
        title: _str(j['title']),
        yearsExperience: _int(j['yearsExperience']),
        skills: (j['skills'] as List? ?? const [])
            .map((e) => Skill.fromJson(e as Map<String, dynamic>))
            .toList(growable: false),
        locations: _strList(j['locations']),
        goals: _strList(j['goals']),
        momentum: Momentum.fromJson(j['momentum'] as Map<String, dynamic>? ?? const {}),
        completeness: _int(j['completeness']),
      );
}

/* ------------------------------------------------------------------- ai -- */

class AiMessage {
  const AiMessage({required this.id, required this.isAgent, required this.text, this.facts = const []});

  final String id;
  final bool isAgent;
  final String text;
  final List<String> facts;

  factory AiMessage.fromJson(Map<String, dynamic> j) => AiMessage(
        id: _str(j['id']),
        isAgent: _str(j['role']) == 'agent',
        text: _str(j['text']),
        facts: _strList(j['facts']),
      );

  factory AiMessage.user(String text) =>
      AiMessage(id: 'local-${DateTime.now().microsecondsSinceEpoch}', isAgent: false, text: text);
}

/* -------------------------------------------------------- notification -- */

class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.read,
    this.href,
  });

  final String id, title, body;
  final bool read;
  final String? href;

  factory AppNotification.fromJson(Map<String, dynamic> j) => AppNotification(
        id: _str(j['id']),
        title: _str(j['title']),
        body: _str(j['body']),
        read: j['read'] == true,
        href: j['href'] as String?,
      );
}
