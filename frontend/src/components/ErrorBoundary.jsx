import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError:false, error:null }
  }
  static getDerivedStateFromError(error){
    return { hasError:true, error }
  }
  componentDidCatch(error, info){
    // Basic logging (could send to backend later)
    console.error('ErrorBoundary caught error', error, info)
  }
  handleReload = () => {
    // Attempt a soft reset of just this boundary
    this.setState({ hasError:false, error:null })
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:'2rem'}}>
          <h2>Something went wrong.</h2>
          <p style={{opacity:.8, maxWidth:520}}>An unexpected error occurred while rendering this section. You can try reloading just this panel or doing a full page refresh.</p>
          {this.state.error && <pre style={{background:'#111', color:'#f88', padding:'1rem', overflow:'auto'}}>{String(this.state.error.message||this.state.error)}</pre>}
          <button onClick={this.handleReload} style={{marginRight:'1rem'}}>Retry Section</button>
          <button onClick={()=> window.location.reload()}>Full Refresh</button>
        </div>
      )
    }
    return this.props.children
  }
}
