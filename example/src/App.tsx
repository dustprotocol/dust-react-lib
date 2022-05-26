import { Components } from '@dust-defi/react-lib'
import '@dust-defi/react-lib/dist/index.css'

const {Button, Card, Icons} = Components;

const App = () => {
  return (
    <div className="m-5 ">
      <h5>Buttons</h5>
      {/* <Button.Nav to="" name="Test" selected={false} /> */}
      <Button.SwitchToken />
      <Button.Icon>
        <Icons.BackIcon />
      </Button.Icon>
      <h5>Cards</h5>
      <Card.Card>
      </Card.Card>
    </div>
  )
}

export default App
