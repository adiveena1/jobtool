import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import 'api_result.dart';

/// The single HTTP entry point for the mobile app.
///
/// It speaks the same envelope as the web client: `{ok, data}` or
/// `{ok:false, error}`. Nothing above this class ever sees a status code, and
/// no screen ever renders a raw exception.
class ApiClient {
  ApiClient({
    required this.baseUrl,
    http.Client? client,
    FlutterSecureStorage? storage,
  })  : _client = client ?? http.Client(),
        _storage = storage ?? const FlutterSecureStorage();

  /// Points at the same backend the website uses. HTTPS in every build that
  /// leaves a developer machine.
  final String baseUrl;

  final http.Client _client;
  final FlutterSecureStorage _storage;

  static const _tokenKey = 'career_os_access_token';
  static const _timeout = Duration(seconds: 12);

  /// Access tokens live in the Keychain / EncryptedSharedPreferences, never in
  /// plain preferences and never in the widget tree.
  Future<void> saveToken(String token) => _storage.write(key: _tokenKey, value: token);
  Future<void> clearToken() => _storage.delete(key: _tokenKey);
  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<Map<String, String>> _headers() async {
    final token = await readToken();
    return {
      'content-type': 'application/json',
      'accept': 'application/json',
      if (token != null) 'authorization': 'Bearer $token',
    };
  }

  Future<ApiResult<T>> get<T>(
    String path,
    T Function(Object? json) decode, {
    Map<String, String>? query,
  }) =>
      _send(() async {
        final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
        return _client.get(uri, headers: await _headers()).timeout(_timeout);
      }, decode);

  Future<ApiResult<T>> post<T>(
    String path,
    T Function(Object? json) decode, {
    Object? body,
  }) =>
      _send(() async {
        final uri = Uri.parse('$baseUrl$path');
        return _client
            .post(uri, headers: await _headers(), body: jsonEncode(body ?? const {}))
            .timeout(_timeout);
      }, decode);

  Future<ApiResult<T>> patch<T>(
    String path,
    T Function(Object? json) decode, {
    Object? body,
  }) =>
      _send(() async {
        final uri = Uri.parse('$baseUrl$path');
        return _client
            .patch(uri, headers: await _headers(), body: jsonEncode(body ?? const {}))
            .timeout(_timeout);
      }, decode);

  /// One retry on transport failure only. A 4xx is an answer, not a fault, so
  /// it is never retried.
  Future<ApiResult<T>> _send<T>(
    Future<http.Response> Function() run,
    T Function(Object? json) decode,
  ) async {
    for (var attempt = 0; attempt < 2; attempt++) {
      try {
        final res = await run();
        final decoded = jsonDecode(res.body);

        if (decoded is! Map<String, dynamic>) {
          return ApiResult.failure(
            const ApiError(code: ApiErrorCode.internal, message: 'Something went wrong. Try again.'),
          );
        }

        if (decoded['ok'] == true) {
          return ApiResult.success(
            decode(decoded['data']),
            meta: decoded['meta'] is Map<String, dynamic>
                ? PageMeta.fromJson(decoded['meta'] as Map<String, dynamic>)
                : null,
          );
        }

        return ApiResult.failure(
          ApiError.fromJson(decoded['error'] as Map<String, dynamic>? ?? const {}),
        );
      } on TimeoutException {
        if (attempt == 1) return ApiResult.failure(ApiError.offline());
      } on SocketException {
        if (attempt == 1) return ApiResult.failure(ApiError.offline());
      } catch (_) {
        return ApiResult.failure(
          const ApiError(code: ApiErrorCode.internal, message: 'Something went wrong. Try again.'),
        );
      }
    }
    return ApiResult.failure(ApiError.offline());
  }

  void dispose() => _client.close();
}
