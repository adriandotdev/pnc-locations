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

const mysql = require("../database/mysql");

const BasicTokenVerifier = require("./BasicTokenVerifier");

const LocationsRepository = require("../repository/LocationsRepository");

const repository = new LocationsRepository();

const EVSE = new GraphQLObjectType({
	name: "EVSE",
	fields: () => ({
		uid: { type: GraphQLString },
		evse_id: { type: GraphQLString },
		serial_number: { type: GraphQLString },
		meter_type: { type: GraphQLString },
		status: { type: GraphQLString },
		cpo_location_id: { type: GraphQLInt },
		current_ws_connection_id: { type: GraphQLString },
		server_id: { type: GraphQLString },
		date_created: { type: GraphQLString },
	}),
});

const LOCATIONS = new GraphQLObjectType({
	name: "LOCATIONS",
	fields: () => ({
		id: { type: GraphQLInt },
		publish: { type: GraphQLBoolean },
		name: { type: GraphQLString },
		address: { type: GraphQLString },
		address_lat: { type: GraphQLFloat },
		address_lng: { type: GraphQLFloat },
		city: { type: GraphQLString },
		date_created: { type: GraphQLString },
		date_modified: { type: GraphQLString },
		distance: { type: GraphQLFloat },
		evses: {
			type: new GraphQLList(EVSE),
			resolve: async function (parent, _, context) {
				const result = await repository.GetEVSE(parent.id);

				return result;
			},
		},
	}),
});

const FAVORITE_LOCATION_TYPE = new GraphQLObjectType({
	name: "FAVORITE_LOCATION",
	fields: () => ({
		user_id: { type: GraphQLInt },
		cpo_location_id: { type: GraphQLInt },
	}),
});

const CPO_OWNERS = new GraphQLObjectType({
	name: "CPO_OWNERS",
	fields: () => ({
		id: { type: GraphQLInt },
		user_id: { type: GraphQLInt },
		party_id: { type: GraphQLString },
		cpo_owner_name: { type: GraphQLString },
		contact_name: { type: GraphQLString },
		contact_number: { type: GraphQLString },
		contact_email: { type: GraphQLString },
		logo: { type: GraphQLString },
	}),
});

const LOCATIONS_WITH_FAVORITES = new GraphQLObjectType({
	name: "LOCATION_WITH_FAVORITES",
	fields: () => ({
		id: { type: GraphQLInt },
		publish: { type: GraphQLBoolean },
		name: { type: GraphQLString },
		address: { type: GraphQLString },
		address_lat: { type: GraphQLFloat },
		address_lng: { type: GraphQLFloat },
		city: { type: GraphQLString },
		date_created: { type: GraphQLString },
		date_modified: { type: GraphQLString },
		distance: { type: GraphQLFloat },
		favorite: { type: GraphQLString },
		evses: {
			type: new GraphQLList(EVSE),
			resolve: async function (parent, _, context) {
				const result = await repository.GetEVSE(parent.id);

				return result;
			},
		},
	}),
});

const RootQuery = new GraphQLObjectType({
	name: "RootQueryType",
	fields: {
		cpo_owners: {
			type: new GraphQLList(CPO_OWNERS),
			resolve: async function () {
				const result = await repository.GetCPOOwners();

				return result;
			},
		},
		locations: {
			type: new GraphQLList(LOCATIONS),
			args: {
				lat: { type: GraphQLFloat },
				lng: { type: GraphQLFloat },
			},
			resolve: async function (_, args, context) {
				BasicTokenVerifier(context.auth);

				const result = await repository.GetLocations({
					lat: args.lat,
					lng: args.lng,
				});

				return result;
			},
		},
		location_favorites: {
			type: new GraphQLList(LOCATIONS_WITH_FAVORITES),
			args: {
				lat: { type: GraphQLFloat },
				lng: { type: GraphQLFloat },
			},
			resolve: async function (_, args, context) {
				// BasicTokenVerifier(context.auth);

				const result = await repository.GetLocationsWithFavorites({
					lat: args.lat,
					lng: args.lng,
				});

				return result;
			},
		},
	},
});

const MutationType = new GraphQLObjectType({
	name: "Mutation",
	fields: {
		addToFavoriteLocation: {
			type: FAVORITE_LOCATION_TYPE,
			args: {
				user_id: { type: GraphQLInt },
				cpo_location_id: { type: GraphQLInt },
			},
			resolve: function (parent, args) {
				const query = `INSERT INTO favorite_merchants (user_id, cpo_location_id) VALUES (?,?)`;

				return new Promise((resolve, reject) => {
					mysql.query(
						query,
						[args.user_id, args.cpo_location_id],
						(err, result) => {
							if (err) {
								reject(err);
							}
							resolve({
								user_id: args.user_id,
								cpo_location_id: args.cpo_location_id,
							});
						}
					);
				});
			},
		},
	},
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: MutationType,
});
