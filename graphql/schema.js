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

const logger = require("../config/winston");

const {
	EVSE_CAPABILITIES,
	EVSE_PAYMENT_TYPES,
	LOCATION_FACILITIES,
	LOCATION_PARKING_RESTRICTIONS,
	LOCATION_PARKING_TYPES,
} = require("./defaults");

const CONNECTOR = new GraphQLObjectType({
	name: "CONNECTOR",
	fields: () => ({
		id: { type: GraphQLInt },
		evse_uid: { type: GraphQLString },
		connector_id: { type: GraphQLInt },
		standard: { type: GraphQLString },
		format: { type: GraphQLString },
		max_voltage: { type: GraphQLInt },
		max_amperage: { type: GraphQLInt },
		max_electric_power: { type: GraphQLInt },
		status: { type: GraphQLString },
		date_created: { type: GraphQLString },
		date_modified: { type: GraphQLString },
	}),
});

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
		connectors: {
			type: new GraphQLList(CONNECTOR),
			resolve: async function (parent) {
				const result = await repository.GetConnectors(parent.uid);

				return result;
			},
		},
		capabilities: {
			type: new GraphQLList(EVSE_CAPABILITIES),
			resolve: async function (parent) {
				const result = await repository.GetEVSECapabilities(parent.uid);

				return result;
			},
		},
		payment_types: {
			type: new GraphQLList(EVSE_PAYMENT_TYPES),
			resolve: async function (parent) {
				const result = await repository.GetEVSEPaymentTypes(parent.uid);

				return result;
			},
		},
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
			resolve: async function (parent) {
				const result = await repository.GetEVSE(parent.id);

				return result;
			},
		},
		facilities: {
			type: new GraphQLList(LOCATION_FACILITIES),
			resolve: async function (parent) {
				const result = await repository.GetLocationFacilities(parent.id);

				return result;
			},
		},
		parking_restrictions: {
			type: new GraphQLList(LOCATION_PARKING_RESTRICTIONS),
			resolve: async function (parent) {
				const result = await repository.GetLocationParkingRestrictions(
					parent.id
				);

				return result;
			},
		},
		parking_types: {
			type: new GraphQLList(LOCATION_PARKING_TYPES),
			resolve: async function (parent) {
				const result = await repository.GetLocationParkingTypes(parent.id);

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
		status: { type: GraphQLInt },
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
			resolve: async function (parent) {
				const result = await repository.GetEVSE(parent.id);

				return result;
			},
		},
		facilities: {
			type: new GraphQLList(LOCATION_FACILITIES),
			resolve: async function (parent) {
				const result = await repository.GetLocationFacilities(parent.id);

				return result;
			},
		},
		parking_restrictions: {
			type: new GraphQLList(LOCATION_PARKING_RESTRICTIONS),
			resolve: async function (parent) {
				const result = await repository.GetLocationParkingRestrictions(
					parent.id
				);

				return result;
			},
		},
		parking_types: {
			type: new GraphQLList(LOCATION_PARKING_TYPES),
			resolve: async function (parent) {
				const result = await repository.GetLocationParkingTypes(parent.id);

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
			resolve: async function (parent) {
				const result = await repository.GetEVSE(parent.id);

				return result;
			},
		},
		facilities: {
			type: new GraphQLList(LOCATION_FACILITIES),
			resolve: async function (parent) {
				const result = await repository.GetLocationFacilities(parent.id);

				return result;
			},
		},
		parking_restrictions: {
			type: new GraphQLList(LOCATION_PARKING_RESTRICTIONS),
			resolve: async function (parent) {
				const result = await repository.GetLocationParkingRestrictions(
					parent.id
				);

				return result;
			},
		},
		parking_types: {
			type: new GraphQLList(LOCATION_PARKING_TYPES),
			resolve: async function (parent) {
				const result = await repository.GetLocationParkingTypes(parent.id);

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
				await AccessTokenVerifier(context.auth);

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
		filter_locations: {
			type: new GraphQLList(LOCATIONS),
			args: {
				lat: { type: GraphQLFloat },
				lng: { type: GraphQLFloat },
				facilities: { type: GraphQLList(GraphQLString) },
				capabilities: { type: GraphQLList(GraphQLString) },
				payment_types: { type: GraphQLList(GraphQLString) },
				parking_types: { type: GraphQLList(GraphQLString) },
				parking_restrictions: { type: GraphQLList(GraphQLString) },
				connector_types: { type: GraphQLList(GraphQLString) },
				power_types: { type: GraphQLList(GraphQLString) },
			},
			resolve: async function (_, args, context) {
				logger.info({ GRAPHQL_FILTER_LOCATIONS: { args, context } });

				BasicTokenVerifier(context.auth);

				let facilities = "";
				let capabilities = "";
				let paymentTypes = "";
				let parkingTypes = "";
				let parkingRestrictions = "";
				let connectorTypes = "";
				let powerTypes = "";

				args.facilities?.forEach((facility) => {
					facilities += `'${facility}', `;
				});

				facilities = facilities.slice(0, facilities.length - 2);

				args.capabilities?.forEach((capability) => {
					capabilities += `'${capability}', `;
				});

				capabilities = capabilities.slice(0, capabilities.length - 2);

				args.payment_types?.forEach((paymentType) => {
					paymentTypes += `'${paymentType}', `;
				});

				paymentTypes = paymentTypes.slice(0, paymentTypes.length - 2);

				args.parking_types?.forEach((parkingType) => {
					parkingTypes += `'${parkingType}', `;
				});

				parkingTypes = parkingTypes.slice(0, parkingTypes.length - 2);

				args.parking_restrictions?.forEach((parkingRestriction) => {
					parkingRestrictions += `'${parkingRestriction}', `;
				});

				parkingRestrictions = parkingRestrictions.slice(
					0,
					parkingRestrictions.length - 2
				);

				args.connector_types?.forEach((connectorType) => {
					connectorTypes += `'${connectorType}', `;
				});

				connectorTypes = connectorTypes.slice(0, connectorTypes.length - 2);

				args.power_types?.forEach((powerType) => {
					powerTypes += `'${powerType}', `;
				});

				powerTypes = powerTypes.slice(0, powerTypes.length - 2);

				const result = await repository.FilterLocations(
					{
						lat: args.lat,
						lng: args.lng,
					},
					facilities,
					capabilities,
					paymentTypes,
					parkingTypes,
					parkingRestrictions,
					connectorTypes,
					powerTypes
				);

				logger.info({ GRAPHQL_FILTER_LOCATIONS_RESPONSE: { result } });

				return result;
			},
		},

		filter_locations_with_favorites: {
			type: new GraphQLList(LOCATIONS_WITH_FAVORITES),
			args: {
				lat: { type: GraphQLFloat },
				lng: { type: GraphQLFloat },
				facilities: { type: GraphQLList(GraphQLString) },
				capabilities: { type: GraphQLList(GraphQLString) },
				payment_types: { type: GraphQLList(GraphQLString) },
				parking_types: { type: GraphQLList(GraphQLString) },
				parking_restrictions: { type: GraphQLList(GraphQLString) },
				connector_types: { type: GraphQLList(GraphQLString) },
				power_types: { type: GraphQLList(GraphQLString) },
			},
			resolve: async function (_, args, context) {
				const verifier = await AccessTokenVerifier(context.auth);

				logger.info({ GRAPHQL_FILTER_LOCATIONS: { args, context } });

				let facilities = "";
				let capabilities = "";
				let paymentTypes = "";
				let parkingTypes = "";
				let parkingRestrictions = "";
				let connectorTypes = "";
				let powerTypes = "";

				args.facilities?.forEach((facility) => {
					facilities += `'${facility}', `;
				});

				facilities = facilities.slice(0, facilities.length - 2);

				args.capabilities?.forEach((capability) => {
					capabilities += `'${capability}', `;
				});

				capabilities = capabilities.slice(0, capabilities.length - 2);

				args.payment_types?.forEach((paymentType) => {
					paymentTypes += `'${paymentType}', `;
				});

				paymentTypes = paymentTypes.slice(0, paymentTypes.length - 2);

				args.parking_types?.forEach((parkingType) => {
					parkingTypes += `'${parkingType}', `;
				});

				parkingTypes = parkingTypes.slice(0, parkingTypes.length - 2);

				args.parking_restrictions?.forEach((parkingRestriction) => {
					parkingRestrictions += `'${parkingRestriction}', `;
				});

				parkingRestrictions = parkingRestrictions.slice(
					0,
					parkingRestrictions.length - 2
				);

				args.connector_types?.forEach((connectorType) => {
					connectorTypes += `'${connectorType}', `;
				});

				connectorTypes = connectorTypes.slice(0, connectorTypes.length - 2);

				args.power_types?.forEach((powerType) => {
					powerTypes += `'${powerType}', `;
				});

				powerTypes = powerTypes.slice(0, powerTypes.length - 2);

				const result = await repository.FilterLocationsWithFavorites(
					{
						lat: args.lat,
						lng: args.lng,
					},
					facilities,
					capabilities,
					paymentTypes,
					parkingTypes,
					parkingRestrictions,
					connectorTypes,
					powerTypes,
					verifier.id
				);

				logger.info({ GRAPHQL_FILTER_LOCATIONS_RESPONSE: { result } });

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
								status: 200,
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
								status: 200,
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
