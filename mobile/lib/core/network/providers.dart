import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/models/models.dart';
import 'api_client.dart';
import 'api_result.dart';

/// Riverpod wiring. Repositories sit between the screens and the HTTP client so
/// no widget ever constructs a URL, and business rules stay on the server.

const _defaultBase = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:3000', // Android emulator's host loopback
);

final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient(baseUrl: _defaultBase);
  ref.onDispose(client.dispose);
  return client;
});

/* ------------------------------------------------------------ repository -- */

class CareerRepository {
  const CareerRepository(this._api);
  final ApiClient _api;

  Future<ApiResult<List<Job>>> jobs({int? minMatch}) => _api.get(
        '/api/jobs',
        (json) => (json as List? ?? const [])
            .map((e) => Job.fromJson(e as Map<String, dynamic>))
            .toList(growable: false),
        query: minMatch == null ? null : {'minMatch': '$minMatch'},
      );

  Future<ApiResult<List<Job>>> matches() => _api.get(
        '/api/jobs/matches',
        (json) => (json as List? ?? const [])
            .map((e) => Job.fromJson(e as Map<String, dynamic>))
            .toList(growable: false),
      );

  Future<ApiResult<List<Application>>> applications({String? stage}) => _api.get(
        '/api/applications',
        (json) => (json as List? ?? const [])
            .map((e) => Application.fromJson(e as Map<String, dynamic>))
            .toList(growable: false),
        query: stage == null ? null : {'stage': stage},
      );

  Future<ApiResult<Application>> apply(String jobId) => _api.post(
        '/api/applications',
        (json) => Application.fromJson(json as Map<String, dynamic>),
        body: {'jobId': jobId},
      );

  Future<ApiResult<CareerProfile>> profile() => _api.get(
        '/api/profile',
        (json) => CareerProfile.fromJson(json as Map<String, dynamic>),
      );

  Future<ApiResult<List<AppNotification>>> notifications() => _api.get(
        '/api/notifications',
        (json) => (json as List? ?? const [])
            .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
            .toList(growable: false),
      );

  Future<ApiResult<AiMessage>> ask(String message) => _api.post(
        '/api/ai/chat',
        (json) => AiMessage.fromJson(json as Map<String, dynamic>),
        body: {'message': message},
      );
}

final repositoryProvider = Provider<CareerRepository>(
  (ref) => CareerRepository(ref.watch(apiClientProvider)),
);

/* ------------------------------------------------------------- app state -- */

final profileProvider = FutureProvider<CareerProfile>((ref) async {
  final res = await ref.watch(repositoryProvider).profile();
  return res.when(
    success: (data, _) => data,
    failure: (e) => throw e,
  );
});

final jobsProvider = FutureProvider<List<Job>>((ref) async {
  final res = await ref.watch(repositoryProvider).jobs();
  return res.when(success: (data, _) => data, failure: (e) => throw e);
});

final applicationsProvider = FutureProvider<List<Application>>((ref) async {
  final res = await ref.watch(repositoryProvider).applications();
  return res.when(success: (data, _) => data, failure: (e) => throw e);
});

final notificationsProvider = FutureProvider<List<AppNotification>>((ref) async {
  final res = await ref.watch(repositoryProvider).notifications();
  return res.when(success: (data, _) => data, failure: (e) => throw e);
});

/// Saved jobs are local-first so the swipe stays instant; a real build syncs
/// this to the backend behind the same repository.
final savedJobsProvider = StateNotifierProvider<SavedJobs, Set<String>>((ref) => SavedJobs());

class SavedJobs extends StateNotifier<Set<String>> {
  SavedJobs() : super(const {});

  void toggle(String id) {
    state = state.contains(id) ? ({...state}..remove(id)) : {...state, id};
  }

  bool has(String id) => state.contains(id);
}

/// Theme mode is app-wide and belongs beside the other cross-cutting state.
final themeModeProvider = StateProvider<ThemeModeChoice>((_) => ThemeModeChoice.system);

enum ThemeModeChoice { system, light, dark }
