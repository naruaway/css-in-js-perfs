# CSS-in-JS benchmarks (now for Kuma UI, maybe I'll expand the scope...)

## The methodology

Render 1000 simple "styled" elements and measure the SSR duration.
In real world web sites, having more than 1000 rendered elements is not so rare.
Measuring SSR duration should be a good approximation for the following:

- Obviously, server side load / cost. If SSR is slow, it can block other tasks
- Approximation for hydration performance
  - Especially for mobile devices, hydration can take a lot of CPU resource. Measuring SSR performance can be a good approximation since most of the library runs the similar computation in server side and client side.

If the styling library is **truly zero runtime**, the performance should be the same as the following code:
```tsx
const PlainButton = (props: { flag: boolean }) => {
  return <button className={props.flag ? 'plain-button-true' : 'plain-button-false'}>My Button</button>
}
```

So this should be treated as "the baseline". For example, when using CSS modules or [Tailwind](https://tailwindcss.com/), the performance should be almost the same as this baseline since there is no runtime at all.
The challenge for all the CSS-in-JS libraries is, **to get the same performance as the baseline especially when the same styling can be easily expressed with CSS modules or Tailwind.**
Note that in theory, CSS-in-JS libraries with compiler support can achieve **better** performance than Tailwind since Tailwind can bloat the HTML size especially when the same element is repeated a lot.


### How to run the benchmark in this repo

```
npm ci
npm run start
```

#### The result in my environment

I ran `npm run start` on my MacBook Air (M2 chip) with Node.js v20.4.0 (tested using commit `c0acd010409c08a370d786215da16416b090756e`):

```
PlainButton: 100% of the baseline (0.277ms)
StaticKuma: 245% of the baseline (0.678ms)
DynamicKuma: 680% of the baseline (1.884ms)
ChakraBox: 778% of the baseline (2.153ms)
```

We see that just using Kuma can slow down the performance even when all the styles can be statically extracted.
Also when styles are dynamic, SSR duration is **680%** of the baseline, which implies expanding the scope of static extraction can be beneficial.

## Kuma UI

[Kuma UI](https://www.kuma-ui.com/) comes with a special compiler, which can precompute "static styles". This allows us to get the same performance as CSS modules or Tailwind **in theory**.
However, as of now (`@kuma-ui/core@1.1.0`), it's much slower due to the following reasons:

- It's actually not "truly zero runtime" even when all the styles are static. `<Button>` never becomes plain `<button>` during compilation.
- Simple conditionals are considered as "dynamic". Practically this patterns appear a lot and can be easily expressed in Tailwind as `props.flag ? "bg-red" : "bg-blue"`
