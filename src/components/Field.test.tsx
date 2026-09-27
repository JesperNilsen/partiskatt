// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Field, type DescribedByProps } from './Field.tsx';

afterEach(cleanup);

/** Minimal input that just renders whatever `describedBy` Field injects, so the test isolates Field's own logic. */
function Probe({ id, describedBy }: { id: string } & DescribedByProps) {
  return <input id={id} aria-describedby={describedBy} />;
}

describe('Field', () => {
  it('passes no describedBy to its input, and renders no hint paragraph, when there is no hint', () => {
    const { container } = render(
      <Field label="Beløp" id="amount">
        <Probe id="amount" />
      </Field>,
    );
    expect(container.querySelector('#amount')!.getAttribute('aria-describedby')).toBeNull();
    expect(container.querySelector('#amount-hint')).toBeNull();
  });

  it('passes "<id>-hint" as describedBy to its input, and renders the hint paragraph with that id', () => {
    const { container } = render(
      <Field label="Beløp" id="amount" hint="Før skatt, pensjon og trygd.">
        <Probe id="amount" />
      </Field>,
    );
    expect(container.querySelector('#amount')!.getAttribute('aria-describedby')).toBe('amount-hint');
    const hint = container.querySelector('#amount-hint');
    expect(hint?.textContent).toBe('Før skatt, pensjon og trygd.');
  });

  it('does not throw when a hint is present but the child is not a single element', () => {
    expect(() => render(<Field label="X" id="y" hint="H">plain text</Field>)).not.toThrow();
  });
});
