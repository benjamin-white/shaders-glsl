import Layout from '@/Layout'
import TexturePlane from './components/TexturePlane'
import { uniforms, fragmentShader } from './shaders/domain-warping-two'
import vertexShader from './shaders/vertex-default.vert'

const App = () => (
  <Layout className={['text-center', 'justify-center']}>
    <h1>ARKLO</h1>
    <TexturePlane shaders={[vertexShader, fragmentShader, uniforms]} />
  </Layout>
)

export default App
