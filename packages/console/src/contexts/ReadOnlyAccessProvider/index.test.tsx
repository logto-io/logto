import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import DomainSelector from '@/components/DomainSelector';
import FormCard from '@/components/FormCard';
import MultiOptionInput from '@/components/MultiOptionInput';
import Checkbox from '@/ds-components/Checkbox';
import CodeEditor from '@/ds-components/CodeEditor';
import ColorPicker from '@/ds-components/ColorPicker';
import KeyValueInputField from '@/ds-components/KeyValueInputField';
import MultiTextInput from '@/ds-components/MultiTextInput';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import Select from '@/ds-components/Select';
import MultiSelect from '@/ds-components/Select/MultiSelect';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import Textarea from '@/ds-components/Textarea';
import ImageUploader from '@/ds-components/Uploader/ImageUploader';
import FileReader from '@/pages/EnterpriseSsoDetails/Connection/FileReader';
import DomainsInput from '@/pages/EnterpriseSsoDetails/Experience/DomainsInput';
import { type EnvTestUtils } from '@/test-utils/env';

import { EditableFieldScope, ReadOnlyAccessContext, ReadOnlyFieldScope } from '.';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('@/ds-components/ConfirmModal', () => ({ __esModule: true, default: () => null }));
jest.mock('react-syntax-highlighter', () => ({ PrismAsyncLight: () => null }));
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ a11yDark: {} }));
jest.mock('@/hooks/use-api', () => ({ __esModule: true, default: () => ({}) }));
jest.mock('@/hooks/use-theme', () => ({ __esModule: true, default: () => 'light' }));
jest.mock('@/components/FeatureTag', () => ({ CombinedAddOnAndFeatureTag: () => null }));
jest.mock('@/hooks/use-available-domains', () => ({
  __esModule: true,
  default: () => ['default.example.com', 'custom.example.com'],
}));

const renderAs = (
  ui: ReactNode,
  {
    isReadOnlyMember = true,
    isInScope = true,
  }: { isReadOnlyMember?: boolean; isInScope?: boolean } = {}
) =>
  render(
    <ReadOnlyAccessContext.Provider value={isReadOnlyMember}>
      {isInScope ? <ReadOnlyFieldScope>{ui}</ReadOnlyFieldScope> : ui}
    </ReadOnlyAccessContext.Provider>
  );

const isTextReadOnly = () => screen.getByRole<HTMLInputElement>('textbox').readOnly;

describe('ReadOnlyFieldScope', () => {
  it('makes fields read-only for a read-only member', () => {
    renderAs(<TextInput />);

    expect(isTextReadOnly()).toBe(true);
  });

  it('leaves fields editable for a member who can write', () => {
    renderAs(<TextInput />, { isReadOnlyMember: false });

    expect(isTextReadOnly()).toBe(false);
  });

  it('leaves fields outside the scope editable', () => {
    renderAs(<TextInput />, { isInScope: false });

    expect(isTextReadOnly()).toBe(false);
  });

  it('leaves fields in an editable scope editable', () => {
    renderAs(
      <EditableFieldScope>
        <TextInput />
      </EditableFieldScope>
    );

    expect(isTextReadOnly()).toBe(false);
  });

  it.each([true, false])('is provided by form cards (read-only member: %s)', (isReadOnlyMember) => {
    renderAs(
      <FormCard title="general.add">
        <TextInput />
      </FormCard>,
      { isReadOnlyMember, isInScope: false }
    );

    expect(isTextReadOnly()).toBe(isReadOnlyMember);
  });

  it('keeps the domain selector usable', () => {
    // The select scrolls its anchor into view on open, which jsdom does not implement.
    Reflect.set(Element.prototype, 'scrollIntoView', jest.fn());
    const onChange = jest.fn();
    renderAs(<DomainSelector value="default.example.com" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /default\.example\.com/ }));
    fireEvent.click(screen.getByText('custom.example.com'));

    expect(onChange).toHaveBeenCalledWith('custom.example.com');
  });
});

describe('inputs in a read-only field scope', () => {
  it('locks text inputs, text areas and code editors', () => {
    renderAs(
      <>
        <Textarea />
        <CodeEditor value="{}" />
      </>
    );

    for (const textbox of screen.getAllByRole<HTMLTextAreaElement>('textbox')) {
      expect(textbox.readOnly).toBe(true);
    }
  });

  it('ignores Tab in code editors', () => {
    const onChange = jest.fn();
    renderAs(<CodeEditor value="{}" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Tab' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('hides the numeric input steppers', () => {
    renderAs(<NumericInput value="1" onValueUp={jest.fn()} onValueDown={jest.fn()} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('disables switches', () => {
    renderAs(<Switch checked={false} onChange={jest.fn()} />);

    expect(screen.getByRole<HTMLInputElement>('checkbox').disabled).toBe(true);
  });

  it('keeps checkboxes and radios from changing', () => {
    const onChange = jest.fn();
    renderAs(
      <>
        <Checkbox checked={false} onChange={onChange} />
        <RadioGroup name="choice" value="a" onChange={onChange}>
          <Radio value="a" title="general.add" />
          <Radio value="b" title="general.add" />
        </RadioGroup>
      </>
    );

    for (const target of [...screen.getAllByRole('checkbox'), ...screen.getAllByRole('radio')]) {
      fireEvent.click(target);
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps selects from changing', () => {
    const onChange = jest.fn();
    const options = [
      { value: 'a', title: 'A' },
      { value: 'b', title: 'B' },
    ];
    const { container } = renderAs(
      <>
        <Select isClearable value="a" options={options} onChange={onChange} />
        <MultiSelect
          value={[options[0]!]}
          options={options}
          onSearch={jest.fn()}
          onChange={onChange}
        />
      </>
    );

    for (const select of screen.getAllByRole('button')) {
      fireEvent.click(select);
    }
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace' });
    expect(screen.queryByText('B')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    // Neither the clear button nor the tag remove button renders.
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('hides add and remove controls', () => {
    renderAs(
      <>
        <MultiTextInput title="general.add" value={['a', 'b']} onChange={jest.fn()} />
        <KeyValueInputField
          fields={[
            { id: '1', key: 'a', value: '1' },
            { id: '2', key: 'b', value: '2' },
          ]}
          getInputFieldProps={{ key: () => ({}), value: () => ({}) }}
          onRemove={jest.fn()}
          onAppend={jest.fn()}
        />
        <ImageUploader
          name="logo"
          value="https://example.com/logo.png"
          onDelete={jest.fn()}
          onUploadErrorChange={jest.fn()}
        />
      </>
    );

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('keeps the color picker closed', () => {
    renderAs(<ColorPicker value="#ffffff" onChange={jest.fn()} />);

    fireEvent.click(screen.getByRole('button'));

    expect(document.querySelector('.ReactModal__Content')).toBeNull();

    expect(screen.getByRole('button').getAttribute('aria-disabled')).toBe('true');
  });

  it('locks tag inputs and the file reader', () => {
    function DomainsInputInForm() {
      const methods = useForm();

      return (
        <FormProvider {...methods}>
          <DomainsInput values={[{ id: '1', value: 'example.com' }]} onChange={jest.fn()} />
        </FormProvider>
      );
    }

    const { container } = renderAs(
      <>
        <MultiOptionInput
          values={['a']}
          renderValue={(value) => value}
          validateInput={(text) => ({ value: text })}
          onChange={jest.fn()}
        />
        <DomainsInputInForm />
        <FileReader
          value="<xml />"
          attributes={{
            accept: {},
            buttonTitle: 'general.add',
            defaultFilename: 'metadata.xml',
            defaultFileMimeType: 'text/xml',
          }}
          setError={jest.fn()}
          onChange={jest.fn()}
        />
      </>
    );

    for (const input of screen.getAllByRole<HTMLInputElement>('textbox')) {
      expect(input.disabled).toBe(true);
    }
    // No tag remove or file remove button renders.
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
