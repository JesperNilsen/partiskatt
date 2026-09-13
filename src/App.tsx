import { Route, Router } from 'wouter';
import { Shell } from './components/Shell.tsx';
import { AppProvider } from './state/app.tsx';
import { CalculatorView } from './views/CalculatorView.tsx';
import { MethodView } from './views/MethodView.tsx';
import { ResultsView } from './views/ResultsView.tsx';
import { SourcesView } from './views/SourcesView.tsx';

export function App() {
  return (
    <AppProvider>
      <Router>
        <Shell>
          <Route path="/" component={CalculatorView} />
          <Route path="/resultat" component={ResultsView} />
          <Route path="/metode" component={MethodView} />
          <Route path="/kilder" component={SourcesView} />
        </Shell>
      </Router>
    </AppProvider>
  );
}
