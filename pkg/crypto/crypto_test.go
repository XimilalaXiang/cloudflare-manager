package crypto

import (
	"testing"
)

func TestEncryptDecryptRoundTrip(t *testing.T) {
	tests := []struct {
		name      string
		plaintext string
		key       string
	}{
		{"simple text", "hello world", "my-secret-key-32-bytes-long!!!!"},
		{"empty string", "", "test-key"},
		{"unicode text", "你好世界 🌍", "unicode-key"},
		{"long text", "a]long string that exceeds typical buffer sizes " +
			"and should still encrypt and decrypt correctly", "long-key"},
		{"short key", "data", "k"},
		{"exact 32-byte key", "data", "12345678901234567890123456789012"},
		{"longer than 32-byte key", "data", "1234567890123456789012345678901234567890"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			encrypted, err := Encrypt(tt.plaintext, tt.key)
			if err != nil {
				t.Fatalf("Encrypt() error = %v", err)
			}

			if encrypted == tt.plaintext && tt.plaintext != "" {
				t.Error("Encrypt() returned plaintext unchanged")
			}

			decrypted, err := Decrypt(encrypted, tt.key)
			if err != nil {
				t.Fatalf("Decrypt() error = %v", err)
			}

			if decrypted != tt.plaintext {
				t.Errorf("Decrypt() = %q, want %q", decrypted, tt.plaintext)
			}
		})
	}
}

func TestDecryptWithWrongKey(t *testing.T) {
	plaintext := "secret data"
	key := "correct-key"
	wrongKey := "wrong-key-here!!"

	encrypted, err := Encrypt(plaintext, key)
	if err != nil {
		t.Fatalf("Encrypt() error = %v", err)
	}

	_, err = Decrypt(encrypted, wrongKey)
	if err == nil {
		t.Error("Decrypt() with wrong key should return error")
	}
}

func TestDecryptInvalidBase64(t *testing.T) {
	_, err := Decrypt("not-valid-base64!!!", "key")
	if err == nil {
		t.Error("Decrypt() with invalid base64 should return error")
	}
}

func TestDecryptTooShort(t *testing.T) {
	_, err := Decrypt("YQ==", "key")
	if err == nil {
		t.Error("Decrypt() with too-short ciphertext should return error")
	}
}

func TestEncryptProducesDifferentCiphertexts(t *testing.T) {
	plaintext := "same data"
	key := "same-key"

	c1, _ := Encrypt(plaintext, key)
	c2, _ := Encrypt(plaintext, key)

	if c1 == c2 {
		t.Error("Encrypt() should produce different ciphertexts due to random nonce")
	}
}

func TestPaddedKey(t *testing.T) {
	tests := []struct {
		name string
		key  string
		want int
	}{
		{"short key", "abc", 32},
		{"exact key", "12345678901234567890123456789012", 32},
		{"long key", "1234567890123456789012345678901234567890", 32},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := paddedKey(tt.key)
			if len(result) != tt.want {
				t.Errorf("paddedKey() length = %d, want %d", len(result), tt.want)
			}
		})
	}
}
