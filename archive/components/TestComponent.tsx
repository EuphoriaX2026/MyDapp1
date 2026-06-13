
import { ERXBuyDebugger } from './ERXBuyDebugger'

export const TestComponent = () => {
  return (
    <div style={{ 
      padding: '20px', 
      color: 'red', 
      backgroundColor: 'yellow',
      border: '5px solid blue',
      position: 'fixed',
      top: '0',
      left: '0',
      zIndex: 9999,
      width: '100%',
      height: '100px',
      overflow: 'auto'
    }}>
      <h1 style={{ color: 'black', fontSize: '24px' }}>TEST COMPONENT VISIBLE!</h1>
      <p style={{ color: 'black', fontSize: '16px' }}>If you can see this, React is working!</p>
      
      <div style={{ marginTop: '20px' }}>
        <ERXBuyDebugger />
      </div>
    </div>
  )
}
