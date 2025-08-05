import { relations } from "drizzle-orm/relations";
import { users, generatedCopy, passwordResetTokens, products, productClaims, personas, personaPillars, emailImageAnalysis, emailFrameworks } from "./schema";

export const generatedCopyRelations = relations(generatedCopy, ({one}) => ({
	user: one(users, {
		fields: [generatedCopy.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	generatedCopies: many(generatedCopy),
	passwordResetTokens: many(passwordResetTokens),
	emailImageAnalyses: many(emailImageAnalysis),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const productClaimsRelations = relations(productClaims, ({one}) => ({
	product: one(products, {
		fields: [productClaims.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	productClaims: many(productClaims),
}));

export const personaPillarsRelations = relations(personaPillars, ({one}) => ({
	persona: one(personas, {
		fields: [personaPillars.personaId],
		references: [personas.id]
	}),
}));

export const personasRelations = relations(personas, ({many}) => ({
	personaPillars: many(personaPillars),
}));

export const emailImageAnalysisRelations = relations(emailImageAnalysis, ({one}) => ({
	user: one(users, {
		fields: [emailImageAnalysis.userId],
		references: [users.id]
	}),
	emailFramework: one(emailFrameworks, {
		fields: [emailImageAnalysis.selectedFramework],
		references: [emailFrameworks.name]
	}),
}));

export const emailFrameworksRelations = relations(emailFrameworks, ({many}) => ({
	emailImageAnalyses: many(emailImageAnalysis),
}));