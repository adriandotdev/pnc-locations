const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLSchema,
	GraphQLList,
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLError,
	GraphQLInt,
} = require("graphql");

const EVSE_PAYMENT_TYPES = new GraphQLObjectType({
	name: "PAYMENT_TYPES",
	fields: () => ({
		id: { type: GraphQLInt },
		code: { type: GraphQLString },
		description: { type: GraphQLString },
	}),
});

const EVSE_CAPABILITIES = new GraphQLObjectType({
	name: "EVSE_CAPABILITIES",
	fields: () => ({
		id: { type: GraphQLInt },
		code: { type: GraphQLString },
		description: { type: GraphQLString },
	}),
});

const LOCATION_FACILITIES = new GraphQLObjectType({
	name: "LOCATION_FACILITIES",
	fields: () => ({
		id: { type: GraphQLInt },
		code: { type: GraphQLString },
		description: { type: GraphQLString },
	}),
});

const LOCATION_PARKING_RESTRICTIONS = new GraphQLObjectType({
	name: "LOCATION_PARKING_RESTRICTIONS",
	fields: () => ({
		id: { type: GraphQLInt },
		code: { type: GraphQLString },
		description: { type: GraphQLString },
	}),
});

const LOCATION_PARKING_TYPES = new GraphQLObjectType({
	name: "LOCATION_PARKING_TYPES",
	fields: () => ({
		id: { type: GraphQLInt },
		code: { type: GraphQLString },
		description: { type: GraphQLString },
	}),
});

module.exports = {
	EVSE_PAYMENT_TYPES,
	EVSE_CAPABILITIES,
	LOCATION_FACILITIES,
	LOCATION_PARKING_RESTRICTIONS,
	LOCATION_PARKING_TYPES,
};
