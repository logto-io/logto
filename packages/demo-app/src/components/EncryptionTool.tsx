import { type FC, useCallback, useState } from 'react';

import { encryptText, decryptText } from '../utils/encryption';

type EncryptionToolProps = {
  readonly decryptedSecret: string;
};

const EncryptionTool: FC<EncryptionToolProps> = ({ decryptedSecret }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [encryptMode, setEncryptMode] = useState(true);

  const handleEncryptDecrypt = useCallback(async () => {
    if (!inputText.trim()) {
      setOutputText('Error: Please enter some text to encrypt/decrypt.');
      return;
    }

    try {
      if (encryptMode) {
        const encrypted = await encryptText(inputText, decryptedSecret);
        setOutputText(encrypted);
      } else {
        const decrypted = await decryptText(inputText, decryptedSecret);
        setOutputText(decrypted);
      }
    } catch (error) {
      setOutputText(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  }, [inputText, decryptedSecret, encryptMode]);

  const handleModeChange = useCallback((mode: boolean) => {
    setEncryptMode(mode);
    setInputText('');
    setOutputText('');
  }, []);

  return (
    <div
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        paddingTop: '20px',
        marginTop: '20px',
      }}
    >
      <div
        style={{
          marginBottom: '15px',
          fontWeight: 'bold',
          fontSize: '1.1em',
          textAlign: 'left',
        }}
      >
        Text Encryption Tool
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          style={{
            padding: '6px 12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            backgroundColor: encryptMode ? '#007bff' : 'rgba(255, 255, 255, 0.1)',
            color: encryptMode ? 'white' : 'inherit',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
          onClick={() => {
            handleModeChange(true);
          }}
        >
          Encrypt
        </button>
        <button
          style={{
            padding: '6px 12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            backgroundColor: encryptMode ? 'rgba(255, 255, 255, 0.1)' : '#007bff',
            color: encryptMode ? 'inherit' : 'white',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
          onClick={() => {
            handleModeChange(false);
          }}
        >
          Decrypt
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '5px',
            fontSize: '0.85em',
            fontWeight: 'bold',
          }}
        >
          {encryptMode ? 'Text to encrypt:' : 'Encrypted text to decrypt:'}
        </label>
        <textarea
          value={inputText}
          placeholder={
            encryptMode ? 'Enter text to encrypt...' : 'Enter encrypted text to decrypt...'
          }
          style={{
            width: '100%',
            height: '60px',
            padding: '6px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'inherit',
            resize: 'none',
            boxSizing: 'border-box',
          }}
          onChange={(event) => {
            setInputText(event.target.value);
          }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button
          disabled={!inputText.trim()}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: inputText.trim() ? '#28a745' : '#6c757d',
            color: 'white',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            fontSize: '0.85em',
            fontWeight: 'bold',
          }}
          onClick={handleEncryptDecrypt}
        >
          {encryptMode ? 'Encrypt Text' : 'Decrypt Text'}
        </button>
      </div>

      {outputText && (
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '0.85em',
              fontWeight: 'bold',
            }}
          >
            {encryptMode ? 'Encrypted result:' : 'Decrypted result:'}
          </label>
          <textarea
            readOnly
            value={outputText}
            style={{
              width: '100%',
              height: '60px',
              padding: '6px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              fontSize: '0.85em',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'inherit',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: '5px' }}>
            <button
              style={{
                padding: '4px 8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '0.75em',
              }}
              onClick={async () => {
                await navigator.clipboard.writeText(outputText);
              }}
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncryptionTool;
