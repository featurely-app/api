The RFC is a proposal to add validations and caching the environment variables for better performance. Also, since we are validating environment variables at runtime, we should also strive to get the static analysis working as well.

> Initially the idea of validations was suggested by @targos and performance bottlenecks were shared by @RomainLanz

## Why cache environment variables?

Accessing environment variables using `process.env` has a huge [performance impact](https://github.com/nodejs/node/issues/3104) on your application boot time *(assuming, most of the calls are during the boot cycle)*.

Since environment variables are not something you will/should mutate during the application lifecycle. It is relatively safe to cache their original value and provide a method to clear the cache (incase someone needs it).

The caching process can be quite simple as explained below:

- Cache the env value after the first access to the `Env.get` method. We will only cache, if it is not `undefined`.
- When reading/parsing the `.env` file. We can cache the values right away, instead of waiting for the first access call.
- Expose a method to clear the entire cache or cache for a single key using `Env.clearCache(key?)`. This can be useful during the tests.


## Validating environment variables

Environment variables are something that we blindly trust and assume will be available in the right shape during the application runtime.

Since environment variables are completely under our control. It is relatively safe to trust them blindly. However, if an environment is missing, the exceptions raised by your code can be confusing and hard to debug. For example:

### The Problem

The following code snippet relies on the `NODE_ENV` environment variable. If the variable is missing, the exception raised by the code doesn't help in figuring out the root problem right away.

```ts
function performSomeAction () {
	if (process.env.NODE_ENV.toLowerCase() === 'development') {
		doSomething()
	}
}
```

<img width="746" alt="Screen Shot 2020-07-06 at 12 35 25 PM" src="https://user-images.githubusercontent.com/1706381/86568260-38597400-bf8a-11ea-9175-4ade9fa5e20d.png">

Of course, you can/should write code that does check for the existence of the variable before performing transformations on it.

But, imagine writing all these conditionals everywhere in your code. **We can do better here. After all, we use frameworks for some reasons.**

### Solution

Let's add support for validating the environment variables as soon as the application is booted and throw meaningful errors to fix them.

The `Env` module can expose a `.validate` method. It accepts an object of key-value pair, where the value is the set of validations to run. For example:

```ts
Env.validate({
	NODE_ENV: Env.schema.string(),
	PORT: Env.schema.number(),
	SOME_KEY: Env.schema.string.optional(),
	FROM_EMAIL: Env.schema.string(function (value) {
	 // optional validate for email format
	})
})
```

Things to notice here:

- The primary validations are around the existence and the subset of data types that exists within Javascript. It includes `string`, `number`, `boolean`.
- I don't think, we need to get fancier with too many validation options. Environment variables are usually simple and needs validations around data type and existence.
- If the in-built `Env.schema` methods are not enough. One can define an inline function as well.

## Support for intellisense

Wouldn't it be frustrating, if runtime validations do ensure that the environment variables are correct, but typescript has no information about it? For example: 

- `Env.get('NODE_ENV')` has a return type of `undefined | string`.
- Similarly `Env.get('PORT')` again has a return type of `string`, whereas it should be a `number`

We can fix this problem literally by writing less than 10 lines of code. The Env module has the [following interface](https://github.com/adonisjs/env/blob/develop/adonis-typings/env.ts#L11) (Just keeping the `get` method for simplicity)

```ts
export interface EnvContract {
	get (key: string, defaultValue?: any): string | boolean | null | undefined
}
```

If we can have an interface that holds the concrete types for each key, then the `get` method can use it as follows:

[Demo](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgKIgG4BUCeAHCAZ2QG8BYAKGWQDkB5AEVQH1UaA1ALmULClADmAGkrUACnQBKWbiACuAWwBG0EVWQAxSXQCyrHQEEAkgBluvfiGGjkAZV0sA0qgCa3OSAAmEGKAifkAB8ePkE1AF9KSggADzwAeygwZFBIWEQUdAwAYXjwKERk8nUBCDAAHkdkWMgvYgBrCBx4mDRMXAJCAD5kAApGnG5HAEpuLI6iAG1HAF1KSIpKBDzeNoxkAF5ScOQ4Yizc-MLKLIA6UrBegHJ6JlYOK+GgA)

```ts
export interface EnvTypes {
	NODE_ENV: string,
	PORT: number,
	FROM_EMAIL: string,
	SOME_KEY: undefined | string,
}

export interface EnvContract {
	get<K extends keyof EnvTypes> (key: K): EnvTypes[K]
}
```

Now the question is, how to generate this interface automatically without manually maintaining it and then living in the fear that the runtime validations and the interface can go out of sync.

How about making the `validate` method generate this interface (or types) for us?

### Validate method signature

The `validate` method uses generics to return the concrete data types for every validated key.

```ts
validate<T extends { [key: string]: (value: string | undefined) => any }> (value: T): {
	[Key in keyof T]: ReturnType<T[Key]>
}
```

### Export validate output from a module

Next step is to export the output of `Env.validate`. Let's assume we decide to validate the variables inside `start/validateEnv.ts` file.

```ts
export default Env.validate({
	NODE_ENV: Env.schema.string(),
	PORT: Env.schema.number(),
	SOME_KEY: Env.schema.string.optional(),
	FROM_EMAIL: Env.schema.string(function (value) {
	 // optional validate for email format
	})
})
```

Now, using declaration merging we can create `EnvTypes` from the return value of `Env.validate`. The following code will go inside `contracts/env.ts` file.

```ts
import validated from '../start/validateEnv'

declare module '@ioc:Adonis/Core/Env' {
	type ValidationTypes = typeof validated
	
	export interface EnvTypes extends ValidationTypes {
	}
}
```

Here's [link](https://www.typescriptlang.org/play?#code/C4TwDgpgBAaghgGwJYBM7AiqBeKpID2AZlAG6KrqYCwAUEgHYYBORcAxtAKIOkAq4CAGcoEAB4YGKEfGRoMWAN4BfOnXFgCzYFEYs2nKD1IBhAk2YcdiulCgBzCMAA8AaVESIUkQGsIIYiNeAUghAD4oAAo-EAAuKFcASnjjEOEAbVcAXVsyCnkIZz4PSWkoRSh0mPihYGZGeyz4yPIEAFcIGrqGqAAfKDapCCJGTEScCLgGEChlCJbEDvi+ZPLcu0z-XQYoGMC+JqgAJSc25gY0os2QLLDc1VoHunZzWqDSHHLlKDgRYzMLFY1LQAPQAKjBtjBUAAgkIhG0ALY9YAACyQIgxHk02kwUCIzAIiLwqOgtTg2hBrUoGGMADpgCIRggIFCQc9XjpqQUsLh6dyqJEbLQ7AA5ADyABEuAB9LiimDNcbYCIAclVABpcgAFcVHPhKiZQABMxq1j0SwPpjmAkVVEulcoVqsSQA) to the simplified version of it inside TS Playground.

