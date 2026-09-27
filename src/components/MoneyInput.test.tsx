// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { kr } from '../engine/money.ts';
import { MoneyInput } from './MoneyInput.tsx';

afterEach(cleanup);

describe('MoneyInput', () => {
  it('aria-describedby is just "<id>-suffix" when no describedBy is given', () => {
    const { container } = render(<MoneyInput id="wage-0" value={kr(0)} onChange={() => {}} />);
    const input = container.querySelector('#wage-0')!;
    expect(input.getAttribute('aria-describedby')).toBe('wage-0-suffix');
    expect(container.querySelector('#wage-0-suffix')?.textContent).toBe('kr/år');
  });

  it('aria-describedby merges "<id>-hint <id>-suffix" when describedBy is given', () => {
    const { container } = render(
      <MoneyInput id="wage-0" value={kr(0)} onChange={() => {}} describedBy="wage-0-hint" />,
    );
    const input = container.querySelector('#wage-0')!;
    expect(input.getAttribute('aria-describedby')).toBe('wage-0-hint wage-0-suffix');
  });

  it('suffix defaults to "kr/år" for a flow like wage', () => {
    const { container } = render(<MoneyInput id="wage-0" value={kr(0)} onChange={() => {}} />);
    expect(container.querySelector('#wage-0-suffix')?.textContent).toBe('kr/år');
  });

  it('a "kr" suffix can be passed for a one-off amount like a wealth field, without touching the describedby id', () => {
    const { container } = render(
      <MoneyInput id="wealth-primary" value={kr(0)} onChange={() => {}} suffix="kr" />,
    );
    const input = container.querySelector('#wealth-primary')!;
    expect(container.querySelector('#wealth-primary-suffix')?.textContent).toBe('kr');
    expect(input.getAttribute('aria-describedby')).toBe('wealth-primary-suffix');
  });
});
