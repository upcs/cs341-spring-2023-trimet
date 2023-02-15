export const APP_ID = "DB9C2B0467902CB970AD9CD6B";

/**
 * Fetches a text file from an external URL, calling functions for success or
 * error.
 *
 * @param url       The URL to fetch the text file from.
 * @param onSuccess The function to call on success. The fetched string will be
 *                  passed as the sole argument.
 * @param onError   The function to call on error. The error status will be
 *                  passed as the sole argument.
 */
export function fetchText(url, onSuccess, onError) {
	$.ajax({
		// Fetch the URL as a raw text file with a two second timeout to avoid
		// waiting forever.
		url: url,
		dataType: "text",
		timeout: 2000,

		// On success, pass the text directly to the success handler.
		success: (data, statusCode, xhr) => {
			onSuccess(data);
		},

		// On error, call the error handler with error information combined
		// into a single string, namely the URL, status summary, and status
		// code.
		error: (xhr, textStatus, statusCode) => {
			onError(`Fetch "${url}" (${textStatus}) ${statusCode}`);
		},
	});
}
