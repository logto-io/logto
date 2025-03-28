import type { PasswordRejectionCode } from "@logto/core-kit";

type BreakdownKeysToObject<Key extends string> = {
	[K in Key as K extends `${infer A}.${string}`
		? A
		: K]: K extends `${string}.${infer B}` ? BreakdownKeysToObject<B> : string;
};

type RejectionPhrases = BreakdownKeysToObject<PasswordRejectionCode>;

const password_rejected = {
	too_short: "Мінімальна довжина – {{min}} символів.",
	too_long: "Максимальна довжина – {{max}} символів.",
	character_types: "Необхідно щонайменше {{min}} типи символів.",
	unsupported_characters: "Знайдено непідтримуваний символ.",
	pwned: "Уникайте простих паролів, які легко вгадати.",
	restricted_found: "Уникайте надмірного використання {{list, list}}.",
	restricted: {
		repetition: "повторюваних символів",
		sequence: "послідовних символів",
		user_info: "ваших персональних даних",
		words: "контексту продукту",
	},
} satisfies RejectionPhrases & {
	// Use for displaying a list of restricted issues
	restricted_found: string;
};

export default Object.freeze(password_rejected);
