import { Button } from '@kuma-ui/core'
import type { ComponentType } from 'react'
import { renderToString } from 'react-dom/server'

const INDEX_ARRAY = Array.from({ length: 1000 }, (_, i) => i)

const PlainButton = (props: { flag: boolean }) => {
  return <button className={props.flag ? 'plain-button-true' : 'plain-button-false'}>My Button</button>
}

const StaticKuma = (props: { flag: boolean }) => {
  return <Button
    color="colors.white"
    bg={["red", "black"]}
    _hover={{ cursor: "pointer" }}
  >
    My Button
  </Button>
}

const DynamicKuma = (props: { flag: boolean }) => {
  return <Button
    color="colors.white"
    bg={props.flag ? ["red", "black"] : ["black", "red"]}
    _hover={{ cursor: props.flag ? "pointer" : undefined }}
  >
    My Button
  </Button>
}

type TargetComponent = ComponentType<{ flag: boolean }>

const App = (props: { target: TargetComponent }) => {
  const Target = props.target
  return INDEX_ARRAY.map(i => <Target key={i} flag={i % 2 === 0} />)
}


const runBenchmark = (target: TargetComponent) => {
  const warmUpCount = 1000
  const iterationCount = 1000

  const run = () => {
    const result = renderToString(<App target={target} />)
    if (result.length < 100) {
      throw new Error('SSR result is probably broken')
    }
  }

  // warm up
  for (let i = 0; i < warmUpCount; ++i) {
    run()
  }

  const start = performance.now()
  for (let i = 0; i < iterationCount; ++i) {
    run()
  }
  const elapsedTime = performance.now() - start

  return elapsedTime / iterationCount
}


const targets: Record<string, TargetComponent> = {
  PlainButton,
  StaticKuma,
  DynamicKuma,
}

const main = () => {
  const results: Record<string, number> = {}
  for (const [name, target] of Object.entries(targets)) {
    const ssrDuration = runBenchmark(target)
    results[name] = ssrDuration
  }

  const baselineSsrDuration = results['PlainButton']
  if (!baselineSsrDuration) {
    throw new Error('baselineSsrDuration is invalid')
  }
  for (const [name, ssrDuration] of Object.entries(results)) {
    console.log(`${name}: ${Math.round((ssrDuration / baselineSsrDuration) * 100)}% of the baseline (${ssrDuration.toFixed(3)}ms)`)
  }
}
main()
