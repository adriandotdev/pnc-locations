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
const AccessTokenVerifier = require("./AccessTokenVerifier");

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

const FAVORITE_LOCATIONS = new GraphQLObjectType({
	name: "FAVORITE_LOCATIONS",
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
		favorite: { type: GraphQLString, defaultValue: "true" },
		evses: {
			type: new GraphQLList(EVSE),
			resolve: async function (parent, _, context) {
				const result = await repository.GetEVSE(parent.id);

				return result;
			},
		},
	}),
});
/**
 * Root
 *
 * This object contains all of the property that can be queried in the graph.
 */
const RootQuery = new GraphQLObjectType({
	name: "RootQueryType",
	fields: {
		cpo_owners: {
			type: new GraphQLList(CPO_OWNERS),
			resolve: async function (_, _, context) {
				const verifier = await AccessTokenVerifier(context.auth);

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
		location_with_favorites: {
			type: new GraphQLList(LOCATIONS_WITH_FAVORITES),
			args: {
				lat: { type: GraphQLFloat },
				lng: { type: GraphQLFloat },
			},
			resolve: async function (_, args, context) {
				// BasicTokenVerifier(context.auth);
				const verifier = await AccessTokenVerifier(context.auth);

				const result = await repository.GetLocationsWithFavorites(
					{
						lat: args.lat,
						lng: args.lng,
					},
					verifier.id
				);

				return result;
			},
		},
		favorite_locations: {
			type: new GraphQLList(FAVORITE_LOCATIONS),
			args: {
				lat: { type: GraphQLFloat },
				lng: { type: GraphQLFloat },
			},
			resolve: async function (_, args, context) {
				const verifier = await AccessTokenVerifier(context.auth);

				const result = await repository.GetFavoriteLocations(
					{
						lat: args.lat,
						lng: args.lng,
					},
					verifier.id
				);

				return result;
			},
		},
	},
});

/**
 * Mutations
 *
 * This object contains all of the methods that can be perform in GraphQL
 */
const MutationType = new GraphQLObjectType({
	name: "Mutation",
	fields: {
		addToFavoriteLocation: {
			type: FAVORITE_LOCATION_TYPE,
			args: {
				cpo_location_id: { type: GraphQLInt },
			},
			resolve: async function (parent, args, context) {
				const verifier = await AccessTokenVerifier(context.auth);

				if (!verifier)
					throw new GraphQLError("Unauthorized", {
						extenstions: { code: 401 },
					});

				const query = `INSERT INTO favorite_merchants (user_id, cpo_location_id) VALUES (?,?) ON DUPLICATE KEY UPDATE 
						user_id = VALUES(user_id),
						cpo_location_id = VALUES(cpo_location_id)`;

				return new Promise((resolve, reject) => {
					mysql.query(
						query,
						[verifier.id, args.cpo_location_id],
						(err, result) => {
							if (err) {
								reject(err);
							}
							resolve({
								user_id: verifier.id,
								cpo_location_id: args.cpo_location_id,
							});
						}
					);
				});
			},
		},
		removeFromFavoriteLocation: {
			type: FAVORITE_LOCATION_TYPE,
			args: {
				cpo_location_id: { type: GraphQLInt },
			},
			resolve: async function (_, args, context) {
				const verifier = await AccessTokenVerifier(context.auth);

				if (!verifier)
					throw new GraphQLError("Unauthorized", { extensions: { code: 401 } });

				const query = `DELETE FROM favorite_merchants WHERE user_id = ? AND cpo_location_id = ?`;

				return new Promise((resolve, reject) => {
					mysql.query(
						query,
						[verifier.id, args.cpo_location_id],
						(err, result) => {
							if (err) {
								reject(err);
							}

							resolve({
								user_id: verifier.id,
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
