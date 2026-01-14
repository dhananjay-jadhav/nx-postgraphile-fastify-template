export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: { input: string; output: string; }
  /**
   * A point in time as described by the [ISO
   * 8601](https://en.wikipedia.org/wiki/ISO_8601) and, if it has a timezone, [RFC
   * 3339](https://datatracker.ietf.org/doc/html/rfc3339) standards. Input values
   * that do not conform to both ISO 8601 and RFC 3339 may be coerced, which may lead
   * to unexpected results.
   */
  Datetime: { input: string; output: string; }
}

/** All input for the create `User` mutation. */
export interface CreateUserInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `User` to be created by this mutation. */
  user: UserInput;
}

/** The output of our create `User` mutation. */
export interface CreateUserPayload {
  __typename?: 'CreateUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `User` that was created by this mutation. */
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UserEdge>;
}


/** The output of our create `User` mutation. */
export interface CreateUserPayloadUserEdgeArgs {
  orderBy?: Array<UserOrderBy>;
}

/** All input for the `deleteUserByEmail` mutation. */
export interface DeleteUserByEmailInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User email address */
  email: Scalars['String']['input'];
}

/** All input for the `deleteUserById` mutation. */
export interface DeleteUserByIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `User` to be deleted. */
  id: Scalars['ID']['input'];
}

/** All input for the `deleteUserByUsername` mutation. */
export interface DeleteUserByUsernameInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Unique username for login */
  username: Scalars['String']['input'];
}

/** All input for the `deleteUser` mutation. */
export interface DeleteUserInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Unique identifier for the user */
  rowId: Scalars['Int']['input'];
}

/** The output of our delete `User` mutation. */
export interface DeleteUserPayload {
  __typename?: 'DeleteUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  deletedUserId?: Maybe<Scalars['ID']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `User` that was deleted by this mutation. */
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UserEdge>;
}


/** The output of our delete `User` mutation. */
export interface DeleteUserPayloadUserEdgeArgs {
  orderBy?: Array<UserOrderBy>;
}

/** The root mutation type which contains root level fields which mutate data. */
export interface Mutation {
  __typename?: 'Mutation';
  /** Creates a single `User`. */
  createUser?: Maybe<CreateUserPayload>;
  /** Deletes a single `User` using a unique key. */
  deleteUser?: Maybe<DeleteUserPayload>;
  /** Deletes a single `User` using a unique key. */
  deleteUserByEmail?: Maybe<DeleteUserPayload>;
  /** Deletes a single `User` using its globally unique id. */
  deleteUserById?: Maybe<DeleteUserPayload>;
  /** Deletes a single `User` using a unique key. */
  deleteUserByUsername?: Maybe<DeleteUserPayload>;
  /** Updates a single `User` using a unique key and a patch. */
  updateUser?: Maybe<UpdateUserPayload>;
  /** Updates a single `User` using a unique key and a patch. */
  updateUserByEmail?: Maybe<UpdateUserPayload>;
  /** Updates a single `User` using its globally unique id and a patch. */
  updateUserById?: Maybe<UpdateUserPayload>;
  /** Updates a single `User` using a unique key and a patch. */
  updateUserByUsername?: Maybe<UpdateUserPayload>;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationCreateUserArgs {
  input: CreateUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserArgs {
  input: DeleteUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserByEmailArgs {
  input: DeleteUserByEmailInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserByIdArgs {
  input: DeleteUserByIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationDeleteUserByUsernameArgs {
  input: DeleteUserByUsernameInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserArgs {
  input: UpdateUserInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserByEmailArgs {
  input: UpdateUserByEmailInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserByIdArgs {
  input: UpdateUserByIdInput;
}


/** The root mutation type which contains root level fields which mutate data. */
export interface MutationUpdateUserByUsernameArgs {
  input: UpdateUserByUsernameInput;
}

/** An object with a globally unique `ID`. */
export interface Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  id: Scalars['ID']['output'];
}

/** Information about pagination in a connection. */
export interface PageInfo {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']['output']>;
}

/** The root query type which gives access points into the data universe. */
export interface Query extends Node {
  __typename?: 'Query';
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  id: Scalars['ID']['output'];
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  /** Get a single `User`. */
  user?: Maybe<User>;
  /** Get a single `User`. */
  userByEmail?: Maybe<User>;
  /** Reads a single `User` using its globally unique `ID`. */
  userById?: Maybe<User>;
  /** Get a single `User`. */
  userByUsername?: Maybe<User>;
  /** Reads and enables pagination through a set of `User`. */
  users?: Maybe<UserConnection>;
}


/** The root query type which gives access points into the data universe. */
export interface QueryNodeArgs {
  id: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserArgs {
  rowId: Scalars['Int']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserByEmailArgs {
  email: Scalars['String']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserByIdArgs {
  id: Scalars['ID']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUserByUsernameArgs {
  username: Scalars['String']['input'];
}


/** The root query type which gives access points into the data universe. */
export interface QueryUsersArgs {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  condition?: InputMaybe<UserCondition>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<UserOrderBy>>;
}

/** All input for the `updateUserByEmail` mutation. */
export interface UpdateUserByEmailInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User email address */
  email: Scalars['String']['input'];
  /** An object where the defined keys will be set on the `User` being updated. */
  patch: UserPatch;
}

/** All input for the `updateUserById` mutation. */
export interface UpdateUserByIdInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The globally unique `ID` which will identify a single `User` to be updated. */
  id: Scalars['ID']['input'];
  /** An object where the defined keys will be set on the `User` being updated. */
  patch: UserPatch;
}

/** All input for the `updateUserByUsername` mutation. */
export interface UpdateUserByUsernameInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An object where the defined keys will be set on the `User` being updated. */
  patch: UserPatch;
  /** Unique username for login */
  username: Scalars['String']['input'];
}

/** All input for the `updateUser` mutation. */
export interface UpdateUserInput {
  /**
   * An arbitrary string value with no semantic meaning. Will be included in the
   * payload verbatim. May be used to track mutations by the client.
   */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** An object where the defined keys will be set on the `User` being updated. */
  patch: UserPatch;
  /** Unique identifier for the user */
  rowId: Scalars['Int']['input'];
}

/** The output of our update `User` mutation. */
export interface UpdateUserPayload {
  __typename?: 'UpdateUserPayload';
  /**
   * The exact same `clientMutationId` that was provided in the mutation input,
   * unchanged and unused. May be used by a client to track mutations.
   */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** Our root query field type. Allows us to run any query from our mutation payload. */
  query?: Maybe<Query>;
  /** The `User` that was updated by this mutation. */
  user?: Maybe<User>;
  /** An edge for our `User`. May be used by Relay 1. */
  userEdge?: Maybe<UserEdge>;
}


/** The output of our update `User` mutation. */
export interface UpdateUserPayloadUserEdgeArgs {
  orderBy?: Array<UserOrderBy>;
}

/** User accounts for the application */
export interface User extends Node {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  /** User email address */
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  id: Scalars['ID']['output'];
  lastLoginAt?: Maybe<Scalars['Datetime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  /** User role: user, admin, moderator, guest */
  role: Scalars['String']['output'];
  /** Unique identifier for the user */
  rowId: Scalars['Int']['output'];
  /** Account status: active, inactive, suspended, deleted */
  status: Scalars['String']['output'];
  updatedAt: Scalars['Datetime']['output'];
  /** Unique username for login */
  username: Scalars['String']['output'];
}

/** A condition to be used against `User` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface UserCondition {
  /** Checks for equality with the object’s `createdAt` field. */
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** Checks for equality with the object’s `email` field. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `role` field. */
  role?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `rowId` field. */
  rowId?: InputMaybe<Scalars['Int']['input']>;
  /** Checks for equality with the object’s `status` field. */
  status?: InputMaybe<Scalars['String']['input']>;
  /** Checks for equality with the object’s `username` field. */
  username?: InputMaybe<Scalars['String']['input']>;
}

/** A connection to a list of `User` values. */
export interface UserConnection {
  __typename?: 'UserConnection';
  /** A list of edges which contains the `User` and cursor to aid in pagination. */
  edges: Array<Maybe<UserEdge>>;
  /** A list of `User` objects. */
  nodes: Array<Maybe<User>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `User` you could get from the connection. */
  totalCount: Scalars['Int']['output'];
}

/** A `User` edge in the connection. */
export interface UserEdge {
  __typename?: 'UserEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']['output']>;
  /** The `User` at the end of the edge. */
  node?: Maybe<User>;
}

/** An input for mutations affecting `User` */
export interface UserInput {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** User email address */
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastLoginAt?: InputMaybe<Scalars['Datetime']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** User role: user, admin, moderator, guest */
  role?: InputMaybe<Scalars['String']['input']>;
  /** Unique identifier for the user */
  rowId?: InputMaybe<Scalars['Int']['input']>;
  /** Account status: active, inactive, suspended, deleted */
  status?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** Unique username for login */
  username: Scalars['String']['input'];
}

/** Methods to use when ordering `User`. */
export type UserOrderBy =
  | 'CREATED_AT_ASC'
  | 'CREATED_AT_DESC'
  | 'EMAIL_ASC'
  | 'EMAIL_DESC'
  | 'NATURAL'
  | 'PRIMARY_KEY_ASC'
  | 'PRIMARY_KEY_DESC'
  | 'ROLE_ASC'
  | 'ROLE_DESC'
  | 'ROW_ID_ASC'
  | 'ROW_ID_DESC'
  | 'STATUS_ASC'
  | 'STATUS_DESC'
  | 'USERNAME_ASC'
  | 'USERNAME_DESC';

/** Represents an update to a `User`. Fields that are set will be updated. */
export interface UserPatch {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** User email address */
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastLoginAt?: InputMaybe<Scalars['Datetime']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** User role: user, admin, moderator, guest */
  role?: InputMaybe<Scalars['String']['input']>;
  /** Unique identifier for the user */
  rowId?: InputMaybe<Scalars['Int']['input']>;
  /** Account status: active, inactive, suspended, deleted */
  status?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['Datetime']['input']>;
  /** Unique username for login */
  username?: InputMaybe<Scalars['String']['input']>;
}
