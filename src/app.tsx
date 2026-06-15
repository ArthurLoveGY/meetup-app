import { Component, PropsWithChildren } from 'react'
import './app.scss'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    console.log('TripCircle App mounted')
  }

  componentDidShow() {
    console.log('TripCircle App shown')
  }

  componentDidHide() {
    console.log('TripCircle App hidden')
  }

  render() {
    return this.props.children
  }
}

export default App
