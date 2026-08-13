import 'package:equatable/equatable.dart';

/// Mirrors web/src/types/api.ts. The two clients must agree on this vocabulary
/// or the backend ends up with two dialects.
enum ApiErrorCode {
  unauthorized,
  forbidden,
  notFound,
  validationFailed,
  rateLimited,
  upstreamUnavailable,
  internal;

  static ApiErrorCode parse(String? raw) => switch (raw) {
        'unauthorized' => ApiErrorCode.unauthorized,
        'forbidden' => ApiErrorCode.forbidden,
        'not_found' => ApiErrorCode.notFound,
        'validation_failed' => ApiErrorCode.validationFailed,
        'rate_limited' => ApiErrorCode.rateLimited,
        'upstream_unavailable' => ApiErrorCode.upstreamUnavailable,
        _ => ApiErrorCode.internal,
      };
}

class ApiError extends Equatable {
  const ApiError({
    required this.code,
    required this.message,
    this.fields = const {},
    this.retryAfterSeconds,
  });

  final ApiErrorCode code;

  /// Always safe to put on screen as-is.
  final String message;
  final Map<String, String> fields;
  final int? retryAfterSeconds;

  factory ApiError.fromJson(Map<String, dynamic> json) => ApiError(
        code: ApiErrorCode.parse(json['code'] as String?),
        message: (json['message'] as String?) ?? 'Something went wrong. Try again.',
        fields: (json['fields'] as Map<String, dynamic>? ?? const {})
            .map((k, v) => MapEntry(k, v.toString())),
        retryAfterSeconds: json['retryAfterSeconds'] as int?,
      );

  factory ApiError.offline() => const ApiError(
        code: ApiErrorCode.upstreamUnavailable,
        message: "You're offline. We'll reconnect automatically.",
      );

  bool get isOffline =>
      code == ApiErrorCode.upstreamUnavailable && message.startsWith("You're offline");

  @override
  List<Object?> get props => [code, message, fields, retryAfterSeconds];
}

class PageMeta extends Equatable {
  const PageMeta({
    required this.page,
    required this.perPage,
    required this.total,
    required this.hasMore,
  });

  final int page, perPage, total;
  final bool hasMore;

  factory PageMeta.fromJson(Map<String, dynamic> json) => PageMeta(
        page: json['page'] as int? ?? 1,
        perPage: json['perPage'] as int? ?? 20,
        total: json['total'] as int? ?? 0,
        hasMore: json['hasMore'] as bool? ?? false,
      );

  @override
  List<Object?> get props => [page, perPage, total, hasMore];
}

/// Success or failure, never both, and never a thrown exception across a
/// feature boundary.
sealed class ApiResult<T> {
  const ApiResult();

  factory ApiResult.success(T data, {PageMeta? meta}) = ApiSuccess<T>;
  factory ApiResult.failure(ApiError error) = ApiFailure<T>;

  R when<R>({
    required R Function(T data, PageMeta? meta) success,
    required R Function(ApiError error) failure,
  }) {
    final self = this;
    return switch (self) {
      ApiSuccess<T>() => success(self.data, self.meta),
      ApiFailure<T>() => failure(self.error),
    };
  }
}

class ApiSuccess<T> extends ApiResult<T> {
  const ApiSuccess(this.data, {this.meta});
  final T data;
  final PageMeta? meta;
}

class ApiFailure<T> extends ApiResult<T> {
  const ApiFailure(this.error);
  final ApiError error;
}
