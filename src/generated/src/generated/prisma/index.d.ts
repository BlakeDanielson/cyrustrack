
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ConsumptionSession
 * 
 */
export type ConsumptionSession = $Result.DefaultSelection<Prisma.$ConsumptionSessionPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ConsumptionSessions
 * const consumptionSessions = await prisma.consumptionSession.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ConsumptionSessions
   * const consumptionSessions = await prisma.consumptionSession.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.consumptionSession`: Exposes CRUD operations for the **ConsumptionSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConsumptionSessions
    * const consumptionSessions = await prisma.consumptionSession.findMany()
    * ```
    */
  get consumptionSession(): Prisma.ConsumptionSessionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.14.0
   * Query Engine version: 717184b7b35ea05dfa71a3236b7af656013e1e49
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ConsumptionSession: 'ConsumptionSession'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "consumptionSession"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ConsumptionSession: {
        payload: Prisma.$ConsumptionSessionPayload<ExtArgs>
        fields: Prisma.ConsumptionSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConsumptionSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConsumptionSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>
          }
          findFirst: {
            args: Prisma.ConsumptionSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConsumptionSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>
          }
          findMany: {
            args: Prisma.ConsumptionSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>[]
          }
          create: {
            args: Prisma.ConsumptionSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>
          }
          createMany: {
            args: Prisma.ConsumptionSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConsumptionSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>[]
          }
          delete: {
            args: Prisma.ConsumptionSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>
          }
          update: {
            args: Prisma.ConsumptionSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>
          }
          deleteMany: {
            args: Prisma.ConsumptionSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConsumptionSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConsumptionSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>[]
          }
          upsert: {
            args: Prisma.ConsumptionSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConsumptionSessionPayload>
          }
          aggregate: {
            args: Prisma.ConsumptionSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConsumptionSession>
          }
          groupBy: {
            args: Prisma.ConsumptionSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConsumptionSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConsumptionSessionCountArgs<ExtArgs>
            result: $Utils.Optional<ConsumptionSessionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    consumptionSession?: ConsumptionSessionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model ConsumptionSession
   */

  export type AggregateConsumptionSession = {
    _count: ConsumptionSessionCountAggregateOutputType | null
    _avg: ConsumptionSessionAvgAggregateOutputType | null
    _sum: ConsumptionSessionSumAggregateOutputType | null
    _min: ConsumptionSessionMinAggregateOutputType | null
    _max: ConsumptionSessionMaxAggregateOutputType | null
  }

  export type ConsumptionSessionAvgAggregateOutputType = {
    latitude: number | null
    longitude: number | null
    thc_percentage: number | null
    quantity_legacy: number | null
  }

  export type ConsumptionSessionSumAggregateOutputType = {
    latitude: number | null
    longitude: number | null
    thc_percentage: number | null
    quantity_legacy: number | null
  }

  export type ConsumptionSessionMinAggregateOutputType = {
    id: string | null
    date: string | null
    time: string | null
    location: string | null
    latitude: number | null
    longitude: number | null
    who_with: string | null
    vessel: string | null
    accessory_used: string | null
    my_vessel: boolean | null
    my_substance: boolean | null
    strain_name: string | null
    thc_percentage: number | null
    purchased_legally: boolean | null
    state_purchased: string | null
    tobacco: boolean | null
    kief: boolean | null
    concentrate: boolean | null
    quantity: string | null
    quantity_legacy: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConsumptionSessionMaxAggregateOutputType = {
    id: string | null
    date: string | null
    time: string | null
    location: string | null
    latitude: number | null
    longitude: number | null
    who_with: string | null
    vessel: string | null
    accessory_used: string | null
    my_vessel: boolean | null
    my_substance: boolean | null
    strain_name: string | null
    thc_percentage: number | null
    purchased_legally: boolean | null
    state_purchased: string | null
    tobacco: boolean | null
    kief: boolean | null
    concentrate: boolean | null
    quantity: string | null
    quantity_legacy: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ConsumptionSessionCountAggregateOutputType = {
    id: number
    date: number
    time: number
    location: number
    latitude: number
    longitude: number
    who_with: number
    vessel: number
    accessory_used: number
    my_vessel: number
    my_substance: number
    strain_name: number
    thc_percentage: number
    purchased_legally: number
    state_purchased: number
    tobacco: number
    kief: number
    concentrate: number
    quantity: number
    quantity_legacy: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ConsumptionSessionAvgAggregateInputType = {
    latitude?: true
    longitude?: true
    thc_percentage?: true
    quantity_legacy?: true
  }

  export type ConsumptionSessionSumAggregateInputType = {
    latitude?: true
    longitude?: true
    thc_percentage?: true
    quantity_legacy?: true
  }

  export type ConsumptionSessionMinAggregateInputType = {
    id?: true
    date?: true
    time?: true
    location?: true
    latitude?: true
    longitude?: true
    who_with?: true
    vessel?: true
    accessory_used?: true
    my_vessel?: true
    my_substance?: true
    strain_name?: true
    thc_percentage?: true
    purchased_legally?: true
    state_purchased?: true
    tobacco?: true
    kief?: true
    concentrate?: true
    quantity?: true
    quantity_legacy?: true
    created_at?: true
    updated_at?: true
  }

  export type ConsumptionSessionMaxAggregateInputType = {
    id?: true
    date?: true
    time?: true
    location?: true
    latitude?: true
    longitude?: true
    who_with?: true
    vessel?: true
    accessory_used?: true
    my_vessel?: true
    my_substance?: true
    strain_name?: true
    thc_percentage?: true
    purchased_legally?: true
    state_purchased?: true
    tobacco?: true
    kief?: true
    concentrate?: true
    quantity?: true
    quantity_legacy?: true
    created_at?: true
    updated_at?: true
  }

  export type ConsumptionSessionCountAggregateInputType = {
    id?: true
    date?: true
    time?: true
    location?: true
    latitude?: true
    longitude?: true
    who_with?: true
    vessel?: true
    accessory_used?: true
    my_vessel?: true
    my_substance?: true
    strain_name?: true
    thc_percentage?: true
    purchased_legally?: true
    state_purchased?: true
    tobacco?: true
    kief?: true
    concentrate?: true
    quantity?: true
    quantity_legacy?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ConsumptionSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConsumptionSession to aggregate.
     */
    where?: ConsumptionSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsumptionSessions to fetch.
     */
    orderBy?: ConsumptionSessionOrderByWithRelationInput | ConsumptionSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConsumptionSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsumptionSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsumptionSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConsumptionSessions
    **/
    _count?: true | ConsumptionSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConsumptionSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConsumptionSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConsumptionSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConsumptionSessionMaxAggregateInputType
  }

  export type GetConsumptionSessionAggregateType<T extends ConsumptionSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateConsumptionSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConsumptionSession[P]>
      : GetScalarType<T[P], AggregateConsumptionSession[P]>
  }




  export type ConsumptionSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConsumptionSessionWhereInput
    orderBy?: ConsumptionSessionOrderByWithAggregationInput | ConsumptionSessionOrderByWithAggregationInput[]
    by: ConsumptionSessionScalarFieldEnum[] | ConsumptionSessionScalarFieldEnum
    having?: ConsumptionSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConsumptionSessionCountAggregateInputType | true
    _avg?: ConsumptionSessionAvgAggregateInputType
    _sum?: ConsumptionSessionSumAggregateInputType
    _min?: ConsumptionSessionMinAggregateInputType
    _max?: ConsumptionSessionMaxAggregateInputType
  }

  export type ConsumptionSessionGroupByOutputType = {
    id: string
    date: string
    time: string
    location: string
    latitude: number | null
    longitude: number | null
    who_with: string
    vessel: string
    accessory_used: string
    my_vessel: boolean
    my_substance: boolean
    strain_name: string
    thc_percentage: number | null
    purchased_legally: boolean
    state_purchased: string | null
    tobacco: boolean
    kief: boolean
    concentrate: boolean
    quantity: string
    quantity_legacy: number | null
    created_at: Date
    updated_at: Date
    _count: ConsumptionSessionCountAggregateOutputType | null
    _avg: ConsumptionSessionAvgAggregateOutputType | null
    _sum: ConsumptionSessionSumAggregateOutputType | null
    _min: ConsumptionSessionMinAggregateOutputType | null
    _max: ConsumptionSessionMaxAggregateOutputType | null
  }

  type GetConsumptionSessionGroupByPayload<T extends ConsumptionSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConsumptionSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConsumptionSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConsumptionSessionGroupByOutputType[P]>
            : GetScalarType<T[P], ConsumptionSessionGroupByOutputType[P]>
        }
      >
    >


  export type ConsumptionSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    time?: boolean
    location?: boolean
    latitude?: boolean
    longitude?: boolean
    who_with?: boolean
    vessel?: boolean
    accessory_used?: boolean
    my_vessel?: boolean
    my_substance?: boolean
    strain_name?: boolean
    thc_percentage?: boolean
    purchased_legally?: boolean
    state_purchased?: boolean
    tobacco?: boolean
    kief?: boolean
    concentrate?: boolean
    quantity?: boolean
    quantity_legacy?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["consumptionSession"]>

  export type ConsumptionSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    time?: boolean
    location?: boolean
    latitude?: boolean
    longitude?: boolean
    who_with?: boolean
    vessel?: boolean
    accessory_used?: boolean
    my_vessel?: boolean
    my_substance?: boolean
    strain_name?: boolean
    thc_percentage?: boolean
    purchased_legally?: boolean
    state_purchased?: boolean
    tobacco?: boolean
    kief?: boolean
    concentrate?: boolean
    quantity?: boolean
    quantity_legacy?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["consumptionSession"]>

  export type ConsumptionSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    time?: boolean
    location?: boolean
    latitude?: boolean
    longitude?: boolean
    who_with?: boolean
    vessel?: boolean
    accessory_used?: boolean
    my_vessel?: boolean
    my_substance?: boolean
    strain_name?: boolean
    thc_percentage?: boolean
    purchased_legally?: boolean
    state_purchased?: boolean
    tobacco?: boolean
    kief?: boolean
    concentrate?: boolean
    quantity?: boolean
    quantity_legacy?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["consumptionSession"]>

  export type ConsumptionSessionSelectScalar = {
    id?: boolean
    date?: boolean
    time?: boolean
    location?: boolean
    latitude?: boolean
    longitude?: boolean
    who_with?: boolean
    vessel?: boolean
    accessory_used?: boolean
    my_vessel?: boolean
    my_substance?: boolean
    strain_name?: boolean
    thc_percentage?: boolean
    purchased_legally?: boolean
    state_purchased?: boolean
    tobacco?: boolean
    kief?: boolean
    concentrate?: boolean
    quantity?: boolean
    quantity_legacy?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ConsumptionSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "date" | "time" | "location" | "latitude" | "longitude" | "who_with" | "vessel" | "accessory_used" | "my_vessel" | "my_substance" | "strain_name" | "thc_percentage" | "purchased_legally" | "state_purchased" | "tobacco" | "kief" | "concentrate" | "quantity" | "quantity_legacy" | "created_at" | "updated_at", ExtArgs["result"]["consumptionSession"]>

  export type $ConsumptionSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConsumptionSession"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: string
      time: string
      location: string
      latitude: number | null
      longitude: number | null
      who_with: string
      vessel: string
      accessory_used: string
      my_vessel: boolean
      my_substance: boolean
      strain_name: string
      thc_percentage: number | null
      purchased_legally: boolean
      state_purchased: string | null
      tobacco: boolean
      kief: boolean
      concentrate: boolean
      quantity: string
      quantity_legacy: number | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["consumptionSession"]>
    composites: {}
  }

  type ConsumptionSessionGetPayload<S extends boolean | null | undefined | ConsumptionSessionDefaultArgs> = $Result.GetResult<Prisma.$ConsumptionSessionPayload, S>

  type ConsumptionSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConsumptionSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConsumptionSessionCountAggregateInputType | true
    }

  export interface ConsumptionSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConsumptionSession'], meta: { name: 'ConsumptionSession' } }
    /**
     * Find zero or one ConsumptionSession that matches the filter.
     * @param {ConsumptionSessionFindUniqueArgs} args - Arguments to find a ConsumptionSession
     * @example
     * // Get one ConsumptionSession
     * const consumptionSession = await prisma.consumptionSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConsumptionSessionFindUniqueArgs>(args: SelectSubset<T, ConsumptionSessionFindUniqueArgs<ExtArgs>>): Prisma__ConsumptionSessionClient<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConsumptionSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConsumptionSessionFindUniqueOrThrowArgs} args - Arguments to find a ConsumptionSession
     * @example
     * // Get one ConsumptionSession
     * const consumptionSession = await prisma.consumptionSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConsumptionSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, ConsumptionSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConsumptionSessionClient<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConsumptionSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsumptionSessionFindFirstArgs} args - Arguments to find a ConsumptionSession
     * @example
     * // Get one ConsumptionSession
     * const consumptionSession = await prisma.consumptionSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConsumptionSessionFindFirstArgs>(args?: SelectSubset<T, ConsumptionSessionFindFirstArgs<ExtArgs>>): Prisma__ConsumptionSessionClient<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConsumptionSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsumptionSessionFindFirstOrThrowArgs} args - Arguments to find a ConsumptionSession
     * @example
     * // Get one ConsumptionSession
     * const consumptionSession = await prisma.consumptionSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConsumptionSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, ConsumptionSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConsumptionSessionClient<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConsumptionSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsumptionSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConsumptionSessions
     * const consumptionSessions = await prisma.consumptionSession.findMany()
     * 
     * // Get first 10 ConsumptionSessions
     * const consumptionSessions = await prisma.consumptionSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const consumptionSessionWithIdOnly = await prisma.consumptionSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConsumptionSessionFindManyArgs>(args?: SelectSubset<T, ConsumptionSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConsumptionSession.
     * @param {ConsumptionSessionCreateArgs} args - Arguments to create a ConsumptionSession.
     * @example
     * // Create one ConsumptionSession
     * const ConsumptionSession = await prisma.consumptionSession.create({
     *   data: {
     *     // ... data to create a ConsumptionSession
     *   }
     * })
     * 
     */
    create<T extends ConsumptionSessionCreateArgs>(args: SelectSubset<T, ConsumptionSessionCreateArgs<ExtArgs>>): Prisma__ConsumptionSessionClient<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConsumptionSessions.
     * @param {ConsumptionSessionCreateManyArgs} args - Arguments to create many ConsumptionSessions.
     * @example
     * // Create many ConsumptionSessions
     * const consumptionSession = await prisma.consumptionSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConsumptionSessionCreateManyArgs>(args?: SelectSubset<T, ConsumptionSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConsumptionSessions and returns the data saved in the database.
     * @param {ConsumptionSessionCreateManyAndReturnArgs} args - Arguments to create many ConsumptionSessions.
     * @example
     * // Create many ConsumptionSessions
     * const consumptionSession = await prisma.consumptionSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConsumptionSessions and only return the `id`
     * const consumptionSessionWithIdOnly = await prisma.consumptionSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConsumptionSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, ConsumptionSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConsumptionSession.
     * @param {ConsumptionSessionDeleteArgs} args - Arguments to delete one ConsumptionSession.
     * @example
     * // Delete one ConsumptionSession
     * const ConsumptionSession = await prisma.consumptionSession.delete({
     *   where: {
     *     // ... filter to delete one ConsumptionSession
     *   }
     * })
     * 
     */
    delete<T extends ConsumptionSessionDeleteArgs>(args: SelectSubset<T, ConsumptionSessionDeleteArgs<ExtArgs>>): Prisma__ConsumptionSessionClient<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConsumptionSession.
     * @param {ConsumptionSessionUpdateArgs} args - Arguments to update one ConsumptionSession.
     * @example
     * // Update one ConsumptionSession
     * const consumptionSession = await prisma.consumptionSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConsumptionSessionUpdateArgs>(args: SelectSubset<T, ConsumptionSessionUpdateArgs<ExtArgs>>): Prisma__ConsumptionSessionClient<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConsumptionSessions.
     * @param {ConsumptionSessionDeleteManyArgs} args - Arguments to filter ConsumptionSessions to delete.
     * @example
     * // Delete a few ConsumptionSessions
     * const { count } = await prisma.consumptionSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConsumptionSessionDeleteManyArgs>(args?: SelectSubset<T, ConsumptionSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConsumptionSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsumptionSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConsumptionSessions
     * const consumptionSession = await prisma.consumptionSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConsumptionSessionUpdateManyArgs>(args: SelectSubset<T, ConsumptionSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConsumptionSessions and returns the data updated in the database.
     * @param {ConsumptionSessionUpdateManyAndReturnArgs} args - Arguments to update many ConsumptionSessions.
     * @example
     * // Update many ConsumptionSessions
     * const consumptionSession = await prisma.consumptionSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConsumptionSessions and only return the `id`
     * const consumptionSessionWithIdOnly = await prisma.consumptionSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ConsumptionSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, ConsumptionSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConsumptionSession.
     * @param {ConsumptionSessionUpsertArgs} args - Arguments to update or create a ConsumptionSession.
     * @example
     * // Update or create a ConsumptionSession
     * const consumptionSession = await prisma.consumptionSession.upsert({
     *   create: {
     *     // ... data to create a ConsumptionSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConsumptionSession we want to update
     *   }
     * })
     */
    upsert<T extends ConsumptionSessionUpsertArgs>(args: SelectSubset<T, ConsumptionSessionUpsertArgs<ExtArgs>>): Prisma__ConsumptionSessionClient<$Result.GetResult<Prisma.$ConsumptionSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConsumptionSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsumptionSessionCountArgs} args - Arguments to filter ConsumptionSessions to count.
     * @example
     * // Count the number of ConsumptionSessions
     * const count = await prisma.consumptionSession.count({
     *   where: {
     *     // ... the filter for the ConsumptionSessions we want to count
     *   }
     * })
    **/
    count<T extends ConsumptionSessionCountArgs>(
      args?: Subset<T, ConsumptionSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConsumptionSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConsumptionSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsumptionSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConsumptionSessionAggregateArgs>(args: Subset<T, ConsumptionSessionAggregateArgs>): Prisma.PrismaPromise<GetConsumptionSessionAggregateType<T>>

    /**
     * Group by ConsumptionSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConsumptionSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConsumptionSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConsumptionSessionGroupByArgs['orderBy'] }
        : { orderBy?: ConsumptionSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConsumptionSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConsumptionSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConsumptionSession model
   */
  readonly fields: ConsumptionSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConsumptionSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConsumptionSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ConsumptionSession model
   */
  interface ConsumptionSessionFieldRefs {
    readonly id: FieldRef<"ConsumptionSession", 'String'>
    readonly date: FieldRef<"ConsumptionSession", 'String'>
    readonly time: FieldRef<"ConsumptionSession", 'String'>
    readonly location: FieldRef<"ConsumptionSession", 'String'>
    readonly latitude: FieldRef<"ConsumptionSession", 'Float'>
    readonly longitude: FieldRef<"ConsumptionSession", 'Float'>
    readonly who_with: FieldRef<"ConsumptionSession", 'String'>
    readonly vessel: FieldRef<"ConsumptionSession", 'String'>
    readonly accessory_used: FieldRef<"ConsumptionSession", 'String'>
    readonly my_vessel: FieldRef<"ConsumptionSession", 'Boolean'>
    readonly my_substance: FieldRef<"ConsumptionSession", 'Boolean'>
    readonly strain_name: FieldRef<"ConsumptionSession", 'String'>
    readonly thc_percentage: FieldRef<"ConsumptionSession", 'Float'>
    readonly purchased_legally: FieldRef<"ConsumptionSession", 'Boolean'>
    readonly state_purchased: FieldRef<"ConsumptionSession", 'String'>
    readonly tobacco: FieldRef<"ConsumptionSession", 'Boolean'>
    readonly kief: FieldRef<"ConsumptionSession", 'Boolean'>
    readonly concentrate: FieldRef<"ConsumptionSession", 'Boolean'>
    readonly quantity: FieldRef<"ConsumptionSession", 'String'>
    readonly quantity_legacy: FieldRef<"ConsumptionSession", 'Float'>
    readonly created_at: FieldRef<"ConsumptionSession", 'DateTime'>
    readonly updated_at: FieldRef<"ConsumptionSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConsumptionSession findUnique
   */
  export type ConsumptionSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * Filter, which ConsumptionSession to fetch.
     */
    where: ConsumptionSessionWhereUniqueInput
  }

  /**
   * ConsumptionSession findUniqueOrThrow
   */
  export type ConsumptionSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * Filter, which ConsumptionSession to fetch.
     */
    where: ConsumptionSessionWhereUniqueInput
  }

  /**
   * ConsumptionSession findFirst
   */
  export type ConsumptionSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * Filter, which ConsumptionSession to fetch.
     */
    where?: ConsumptionSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsumptionSessions to fetch.
     */
    orderBy?: ConsumptionSessionOrderByWithRelationInput | ConsumptionSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConsumptionSessions.
     */
    cursor?: ConsumptionSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsumptionSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsumptionSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConsumptionSessions.
     */
    distinct?: ConsumptionSessionScalarFieldEnum | ConsumptionSessionScalarFieldEnum[]
  }

  /**
   * ConsumptionSession findFirstOrThrow
   */
  export type ConsumptionSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * Filter, which ConsumptionSession to fetch.
     */
    where?: ConsumptionSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsumptionSessions to fetch.
     */
    orderBy?: ConsumptionSessionOrderByWithRelationInput | ConsumptionSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConsumptionSessions.
     */
    cursor?: ConsumptionSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsumptionSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsumptionSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConsumptionSessions.
     */
    distinct?: ConsumptionSessionScalarFieldEnum | ConsumptionSessionScalarFieldEnum[]
  }

  /**
   * ConsumptionSession findMany
   */
  export type ConsumptionSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * Filter, which ConsumptionSessions to fetch.
     */
    where?: ConsumptionSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConsumptionSessions to fetch.
     */
    orderBy?: ConsumptionSessionOrderByWithRelationInput | ConsumptionSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConsumptionSessions.
     */
    cursor?: ConsumptionSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConsumptionSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConsumptionSessions.
     */
    skip?: number
    distinct?: ConsumptionSessionScalarFieldEnum | ConsumptionSessionScalarFieldEnum[]
  }

  /**
   * ConsumptionSession create
   */
  export type ConsumptionSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * The data needed to create a ConsumptionSession.
     */
    data: XOR<ConsumptionSessionCreateInput, ConsumptionSessionUncheckedCreateInput>
  }

  /**
   * ConsumptionSession createMany
   */
  export type ConsumptionSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConsumptionSessions.
     */
    data: ConsumptionSessionCreateManyInput | ConsumptionSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConsumptionSession createManyAndReturn
   */
  export type ConsumptionSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * The data used to create many ConsumptionSessions.
     */
    data: ConsumptionSessionCreateManyInput | ConsumptionSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConsumptionSession update
   */
  export type ConsumptionSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * The data needed to update a ConsumptionSession.
     */
    data: XOR<ConsumptionSessionUpdateInput, ConsumptionSessionUncheckedUpdateInput>
    /**
     * Choose, which ConsumptionSession to update.
     */
    where: ConsumptionSessionWhereUniqueInput
  }

  /**
   * ConsumptionSession updateMany
   */
  export type ConsumptionSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConsumptionSessions.
     */
    data: XOR<ConsumptionSessionUpdateManyMutationInput, ConsumptionSessionUncheckedUpdateManyInput>
    /**
     * Filter which ConsumptionSessions to update
     */
    where?: ConsumptionSessionWhereInput
    /**
     * Limit how many ConsumptionSessions to update.
     */
    limit?: number
  }

  /**
   * ConsumptionSession updateManyAndReturn
   */
  export type ConsumptionSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * The data used to update ConsumptionSessions.
     */
    data: XOR<ConsumptionSessionUpdateManyMutationInput, ConsumptionSessionUncheckedUpdateManyInput>
    /**
     * Filter which ConsumptionSessions to update
     */
    where?: ConsumptionSessionWhereInput
    /**
     * Limit how many ConsumptionSessions to update.
     */
    limit?: number
  }

  /**
   * ConsumptionSession upsert
   */
  export type ConsumptionSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * The filter to search for the ConsumptionSession to update in case it exists.
     */
    where: ConsumptionSessionWhereUniqueInput
    /**
     * In case the ConsumptionSession found by the `where` argument doesn't exist, create a new ConsumptionSession with this data.
     */
    create: XOR<ConsumptionSessionCreateInput, ConsumptionSessionUncheckedCreateInput>
    /**
     * In case the ConsumptionSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConsumptionSessionUpdateInput, ConsumptionSessionUncheckedUpdateInput>
  }

  /**
   * ConsumptionSession delete
   */
  export type ConsumptionSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
    /**
     * Filter which ConsumptionSession to delete.
     */
    where: ConsumptionSessionWhereUniqueInput
  }

  /**
   * ConsumptionSession deleteMany
   */
  export type ConsumptionSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConsumptionSessions to delete
     */
    where?: ConsumptionSessionWhereInput
    /**
     * Limit how many ConsumptionSessions to delete.
     */
    limit?: number
  }

  /**
   * ConsumptionSession without action
   */
  export type ConsumptionSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConsumptionSession
     */
    select?: ConsumptionSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConsumptionSession
     */
    omit?: ConsumptionSessionOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ConsumptionSessionScalarFieldEnum: {
    id: 'id',
    date: 'date',
    time: 'time',
    location: 'location',
    latitude: 'latitude',
    longitude: 'longitude',
    who_with: 'who_with',
    vessel: 'vessel',
    accessory_used: 'accessory_used',
    my_vessel: 'my_vessel',
    my_substance: 'my_substance',
    strain_name: 'strain_name',
    thc_percentage: 'thc_percentage',
    purchased_legally: 'purchased_legally',
    state_purchased: 'state_purchased',
    tobacco: 'tobacco',
    kief: 'kief',
    concentrate: 'concentrate',
    quantity: 'quantity',
    quantity_legacy: 'quantity_legacy',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ConsumptionSessionScalarFieldEnum = (typeof ConsumptionSessionScalarFieldEnum)[keyof typeof ConsumptionSessionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type ConsumptionSessionWhereInput = {
    AND?: ConsumptionSessionWhereInput | ConsumptionSessionWhereInput[]
    OR?: ConsumptionSessionWhereInput[]
    NOT?: ConsumptionSessionWhereInput | ConsumptionSessionWhereInput[]
    id?: StringFilter<"ConsumptionSession"> | string
    date?: StringFilter<"ConsumptionSession"> | string
    time?: StringFilter<"ConsumptionSession"> | string
    location?: StringFilter<"ConsumptionSession"> | string
    latitude?: FloatNullableFilter<"ConsumptionSession"> | number | null
    longitude?: FloatNullableFilter<"ConsumptionSession"> | number | null
    who_with?: StringFilter<"ConsumptionSession"> | string
    vessel?: StringFilter<"ConsumptionSession"> | string
    accessory_used?: StringFilter<"ConsumptionSession"> | string
    my_vessel?: BoolFilter<"ConsumptionSession"> | boolean
    my_substance?: BoolFilter<"ConsumptionSession"> | boolean
    strain_name?: StringFilter<"ConsumptionSession"> | string
    thc_percentage?: FloatNullableFilter<"ConsumptionSession"> | number | null
    purchased_legally?: BoolFilter<"ConsumptionSession"> | boolean
    state_purchased?: StringNullableFilter<"ConsumptionSession"> | string | null
    tobacco?: BoolFilter<"ConsumptionSession"> | boolean
    kief?: BoolFilter<"ConsumptionSession"> | boolean
    concentrate?: BoolFilter<"ConsumptionSession"> | boolean
    quantity?: StringFilter<"ConsumptionSession"> | string
    quantity_legacy?: FloatNullableFilter<"ConsumptionSession"> | number | null
    created_at?: DateTimeFilter<"ConsumptionSession"> | Date | string
    updated_at?: DateTimeFilter<"ConsumptionSession"> | Date | string
  }

  export type ConsumptionSessionOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    time?: SortOrder
    location?: SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    who_with?: SortOrder
    vessel?: SortOrder
    accessory_used?: SortOrder
    my_vessel?: SortOrder
    my_substance?: SortOrder
    strain_name?: SortOrder
    thc_percentage?: SortOrderInput | SortOrder
    purchased_legally?: SortOrder
    state_purchased?: SortOrderInput | SortOrder
    tobacco?: SortOrder
    kief?: SortOrder
    concentrate?: SortOrder
    quantity?: SortOrder
    quantity_legacy?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConsumptionSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConsumptionSessionWhereInput | ConsumptionSessionWhereInput[]
    OR?: ConsumptionSessionWhereInput[]
    NOT?: ConsumptionSessionWhereInput | ConsumptionSessionWhereInput[]
    date?: StringFilter<"ConsumptionSession"> | string
    time?: StringFilter<"ConsumptionSession"> | string
    location?: StringFilter<"ConsumptionSession"> | string
    latitude?: FloatNullableFilter<"ConsumptionSession"> | number | null
    longitude?: FloatNullableFilter<"ConsumptionSession"> | number | null
    who_with?: StringFilter<"ConsumptionSession"> | string
    vessel?: StringFilter<"ConsumptionSession"> | string
    accessory_used?: StringFilter<"ConsumptionSession"> | string
    my_vessel?: BoolFilter<"ConsumptionSession"> | boolean
    my_substance?: BoolFilter<"ConsumptionSession"> | boolean
    strain_name?: StringFilter<"ConsumptionSession"> | string
    thc_percentage?: FloatNullableFilter<"ConsumptionSession"> | number | null
    purchased_legally?: BoolFilter<"ConsumptionSession"> | boolean
    state_purchased?: StringNullableFilter<"ConsumptionSession"> | string | null
    tobacco?: BoolFilter<"ConsumptionSession"> | boolean
    kief?: BoolFilter<"ConsumptionSession"> | boolean
    concentrate?: BoolFilter<"ConsumptionSession"> | boolean
    quantity?: StringFilter<"ConsumptionSession"> | string
    quantity_legacy?: FloatNullableFilter<"ConsumptionSession"> | number | null
    created_at?: DateTimeFilter<"ConsumptionSession"> | Date | string
    updated_at?: DateTimeFilter<"ConsumptionSession"> | Date | string
  }, "id">

  export type ConsumptionSessionOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    time?: SortOrder
    location?: SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    who_with?: SortOrder
    vessel?: SortOrder
    accessory_used?: SortOrder
    my_vessel?: SortOrder
    my_substance?: SortOrder
    strain_name?: SortOrder
    thc_percentage?: SortOrderInput | SortOrder
    purchased_legally?: SortOrder
    state_purchased?: SortOrderInput | SortOrder
    tobacco?: SortOrder
    kief?: SortOrder
    concentrate?: SortOrder
    quantity?: SortOrder
    quantity_legacy?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ConsumptionSessionCountOrderByAggregateInput
    _avg?: ConsumptionSessionAvgOrderByAggregateInput
    _max?: ConsumptionSessionMaxOrderByAggregateInput
    _min?: ConsumptionSessionMinOrderByAggregateInput
    _sum?: ConsumptionSessionSumOrderByAggregateInput
  }

  export type ConsumptionSessionScalarWhereWithAggregatesInput = {
    AND?: ConsumptionSessionScalarWhereWithAggregatesInput | ConsumptionSessionScalarWhereWithAggregatesInput[]
    OR?: ConsumptionSessionScalarWhereWithAggregatesInput[]
    NOT?: ConsumptionSessionScalarWhereWithAggregatesInput | ConsumptionSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    date?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    time?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    location?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    latitude?: FloatNullableWithAggregatesFilter<"ConsumptionSession"> | number | null
    longitude?: FloatNullableWithAggregatesFilter<"ConsumptionSession"> | number | null
    who_with?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    vessel?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    accessory_used?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    my_vessel?: BoolWithAggregatesFilter<"ConsumptionSession"> | boolean
    my_substance?: BoolWithAggregatesFilter<"ConsumptionSession"> | boolean
    strain_name?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    thc_percentage?: FloatNullableWithAggregatesFilter<"ConsumptionSession"> | number | null
    purchased_legally?: BoolWithAggregatesFilter<"ConsumptionSession"> | boolean
    state_purchased?: StringNullableWithAggregatesFilter<"ConsumptionSession"> | string | null
    tobacco?: BoolWithAggregatesFilter<"ConsumptionSession"> | boolean
    kief?: BoolWithAggregatesFilter<"ConsumptionSession"> | boolean
    concentrate?: BoolWithAggregatesFilter<"ConsumptionSession"> | boolean
    quantity?: StringWithAggregatesFilter<"ConsumptionSession"> | string
    quantity_legacy?: FloatNullableWithAggregatesFilter<"ConsumptionSession"> | number | null
    created_at?: DateTimeWithAggregatesFilter<"ConsumptionSession"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"ConsumptionSession"> | Date | string
  }

  export type ConsumptionSessionCreateInput = {
    id?: string
    date: string
    time: string
    location: string
    latitude?: number | null
    longitude?: number | null
    who_with: string
    vessel: string
    accessory_used: string
    my_vessel?: boolean
    my_substance?: boolean
    strain_name: string
    thc_percentage?: number | null
    purchased_legally?: boolean
    state_purchased?: string | null
    tobacco?: boolean
    kief?: boolean
    concentrate?: boolean
    quantity: string
    quantity_legacy?: number | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConsumptionSessionUncheckedCreateInput = {
    id?: string
    date: string
    time: string
    location: string
    latitude?: number | null
    longitude?: number | null
    who_with: string
    vessel: string
    accessory_used: string
    my_vessel?: boolean
    my_substance?: boolean
    strain_name: string
    thc_percentage?: number | null
    purchased_legally?: boolean
    state_purchased?: string | null
    tobacco?: boolean
    kief?: boolean
    concentrate?: boolean
    quantity: string
    quantity_legacy?: number | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConsumptionSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    time?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    who_with?: StringFieldUpdateOperationsInput | string
    vessel?: StringFieldUpdateOperationsInput | string
    accessory_used?: StringFieldUpdateOperationsInput | string
    my_vessel?: BoolFieldUpdateOperationsInput | boolean
    my_substance?: BoolFieldUpdateOperationsInput | boolean
    strain_name?: StringFieldUpdateOperationsInput | string
    thc_percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    purchased_legally?: BoolFieldUpdateOperationsInput | boolean
    state_purchased?: NullableStringFieldUpdateOperationsInput | string | null
    tobacco?: BoolFieldUpdateOperationsInput | boolean
    kief?: BoolFieldUpdateOperationsInput | boolean
    concentrate?: BoolFieldUpdateOperationsInput | boolean
    quantity?: StringFieldUpdateOperationsInput | string
    quantity_legacy?: NullableFloatFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsumptionSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    time?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    who_with?: StringFieldUpdateOperationsInput | string
    vessel?: StringFieldUpdateOperationsInput | string
    accessory_used?: StringFieldUpdateOperationsInput | string
    my_vessel?: BoolFieldUpdateOperationsInput | boolean
    my_substance?: BoolFieldUpdateOperationsInput | boolean
    strain_name?: StringFieldUpdateOperationsInput | string
    thc_percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    purchased_legally?: BoolFieldUpdateOperationsInput | boolean
    state_purchased?: NullableStringFieldUpdateOperationsInput | string | null
    tobacco?: BoolFieldUpdateOperationsInput | boolean
    kief?: BoolFieldUpdateOperationsInput | boolean
    concentrate?: BoolFieldUpdateOperationsInput | boolean
    quantity?: StringFieldUpdateOperationsInput | string
    quantity_legacy?: NullableFloatFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsumptionSessionCreateManyInput = {
    id?: string
    date: string
    time: string
    location: string
    latitude?: number | null
    longitude?: number | null
    who_with: string
    vessel: string
    accessory_used: string
    my_vessel?: boolean
    my_substance?: boolean
    strain_name: string
    thc_percentage?: number | null
    purchased_legally?: boolean
    state_purchased?: string | null
    tobacco?: boolean
    kief?: boolean
    concentrate?: boolean
    quantity: string
    quantity_legacy?: number | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ConsumptionSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    time?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    who_with?: StringFieldUpdateOperationsInput | string
    vessel?: StringFieldUpdateOperationsInput | string
    accessory_used?: StringFieldUpdateOperationsInput | string
    my_vessel?: BoolFieldUpdateOperationsInput | boolean
    my_substance?: BoolFieldUpdateOperationsInput | boolean
    strain_name?: StringFieldUpdateOperationsInput | string
    thc_percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    purchased_legally?: BoolFieldUpdateOperationsInput | boolean
    state_purchased?: NullableStringFieldUpdateOperationsInput | string | null
    tobacco?: BoolFieldUpdateOperationsInput | boolean
    kief?: BoolFieldUpdateOperationsInput | boolean
    concentrate?: BoolFieldUpdateOperationsInput | boolean
    quantity?: StringFieldUpdateOperationsInput | string
    quantity_legacy?: NullableFloatFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConsumptionSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    time?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    who_with?: StringFieldUpdateOperationsInput | string
    vessel?: StringFieldUpdateOperationsInput | string
    accessory_used?: StringFieldUpdateOperationsInput | string
    my_vessel?: BoolFieldUpdateOperationsInput | boolean
    my_substance?: BoolFieldUpdateOperationsInput | boolean
    strain_name?: StringFieldUpdateOperationsInput | string
    thc_percentage?: NullableFloatFieldUpdateOperationsInput | number | null
    purchased_legally?: BoolFieldUpdateOperationsInput | boolean
    state_purchased?: NullableStringFieldUpdateOperationsInput | string | null
    tobacco?: BoolFieldUpdateOperationsInput | boolean
    kief?: BoolFieldUpdateOperationsInput | boolean
    concentrate?: BoolFieldUpdateOperationsInput | boolean
    quantity?: StringFieldUpdateOperationsInput | string
    quantity_legacy?: NullableFloatFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ConsumptionSessionCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    time?: SortOrder
    location?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    who_with?: SortOrder
    vessel?: SortOrder
    accessory_used?: SortOrder
    my_vessel?: SortOrder
    my_substance?: SortOrder
    strain_name?: SortOrder
    thc_percentage?: SortOrder
    purchased_legally?: SortOrder
    state_purchased?: SortOrder
    tobacco?: SortOrder
    kief?: SortOrder
    concentrate?: SortOrder
    quantity?: SortOrder
    quantity_legacy?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConsumptionSessionAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    thc_percentage?: SortOrder
    quantity_legacy?: SortOrder
  }

  export type ConsumptionSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    time?: SortOrder
    location?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    who_with?: SortOrder
    vessel?: SortOrder
    accessory_used?: SortOrder
    my_vessel?: SortOrder
    my_substance?: SortOrder
    strain_name?: SortOrder
    thc_percentage?: SortOrder
    purchased_legally?: SortOrder
    state_purchased?: SortOrder
    tobacco?: SortOrder
    kief?: SortOrder
    concentrate?: SortOrder
    quantity?: SortOrder
    quantity_legacy?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConsumptionSessionMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    time?: SortOrder
    location?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    who_with?: SortOrder
    vessel?: SortOrder
    accessory_used?: SortOrder
    my_vessel?: SortOrder
    my_substance?: SortOrder
    strain_name?: SortOrder
    thc_percentage?: SortOrder
    purchased_legally?: SortOrder
    state_purchased?: SortOrder
    tobacco?: SortOrder
    kief?: SortOrder
    concentrate?: SortOrder
    quantity?: SortOrder
    quantity_legacy?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ConsumptionSessionSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    thc_percentage?: SortOrder
    quantity_legacy?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}