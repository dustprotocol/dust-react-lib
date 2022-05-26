# @dust-defi/react-lib

> Dust React Library

[![NPM](https://img.shields.io/npm/v/@dust-defi/react-lib.svg)](https://www.npmjs.com/package/@dust-defi/react-lib) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
yarn add @dust-defi/react-lib
```

## Usage

```tsx
import React, { Component } from 'react'

import { Components } from '@dust-defi/react-lib'
import '@dust-defi/react-lib/dist/index.css'

const { Card, Button } = Components;

const Example = (): JSX.Element => (
  <Card.Card>
    <Card.Header>
      <Card.Title>Hello from the other side!</Card.Title>
      <Button.Back onClick={() => {}} />
    </Card.Header>
  </Card.Card>
)
```

## License

MIT © [Frenkiee](https://github.com/Frenkiee)
