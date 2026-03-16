import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center">
            <h1 className="text-2xl font-bold mb-3">Simple Trade</h1>
            <p className="text-zinc-400 mb-6">Une erreur est survenue. Recharge la page.</p>
            <button
              className="w-full bg-white text-black rounded-xl py-3 font-semibold"
              onClick={() => window.location.reload()}
            >
              Recharger
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
