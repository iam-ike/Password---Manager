// Enhanced Password Manager with more features
class PasswordManager {
    constructor() {
        this.passwords = JSON.parse(localStorage.getItem('encryptedPasswords')) || [];
        this.masterPassword = localStorage.getItem('masterPasswordHash');
        this.isUnlocked = false;
        this.init();
    }

    init() {
        this.checkFirstTime();
        this.displayPasswords();
        this.updateStatistics();
        
        // Event listeners
        document.getElementById('password').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });
        
        document.getElementById('passwordLength').addEventListener('input', (e) => {
            document.getElementById('lengthValue').textContent = `${e.target.value} characters`;
        });
    }

    checkFirstTime() {
        if (!this.masterPassword) {
            document.getElementById('masterPasswordSection').classList.remove('hidden');
        } else {
            document.getElementById('loginSection').classList.remove('hidden');
        }
    }

    setMasterPassword() {
        const password = document.getElementById('masterPassword').value;
        const confirm = document.getElementById('confirmMasterPassword').value;

        if (!password || !confirm) {
            alert('Please fill in both fields');
            return;
        }

        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            alert('Master password must be at least 6 characters long');
            return;
        }

        // Simple hash (in real app, use proper encryption)
        this.masterPassword = this.simpleHash(password);
        localStorage.setItem('masterPasswordHash', this.masterPassword);
        
        document.getElementById('masterPasswordSection').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        this.isUnlocked = true;
        
        alert('Master password set successfully!');
    }

    login() {
        const password = document.getElementById('loginPassword').value;
        const hash = this.simpleHash(password);

        if (hash === this.masterPassword) {
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            this.isUnlocked = true;
        } else {
            alert('Incorrect master password');
        }
    }

    simpleHash(str) {
        // This is a simple demo hash - NOT secure for production!
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    addPassword() {
        if (!this.isUnlocked) {
            alert('Please unlock with master password first');
            return;
        }

        const site = document.getElementById('siteName').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const category = document.getElementById('category').value;

        if (!site || !username || !password) {
            alert('Please fill in all fields');
            return;
        }

        const newPassword = {
            id: Date.now(),
            site: site,
            username: username,
            password: password,
            category: category,
            createdAt: new Date().toISOString()
        };

        this.passwords.push(newPassword);
        this.savePasswords();
        
        // Clear inputs
        document.getElementById('siteName').value = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        this.displayPasswords();
        this.updateStatistics();
        alert('Password saved successfully!');
    }

    savePasswords() {
        localStorage.setItem('encryptedPasswords', JSON.stringify(this.passwords));
    }

    generatePassword() {
        const length = parseInt(document.getElementById('passwordLength').value);
        const useUppercase = document.getElementById('useUppercase').checked;
        const useLowercase = document.getElementById('useLowercase').checked;
        const useNumbers = document.getElementById('useNumbers').checked;
        const useSymbols = document.getElementById('useSymbols').checked;

        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let characters = '';
        if (useUppercase) characters += uppercase;
        if (useLowercase) characters += lowercase;
        if (useNumbers) characters += numbers;
        if (useSymbols) characters += symbols;

        if (characters.length === 0) {
            alert('Please select at least one character type');
            return;
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        document.getElementById('generatedPassword').value = password;
        document.getElementById('password').value = password;
        this.checkPasswordStrength(password);
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        
        let strength = 0;
        let feedback = '';

        // Length check
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        
        // Character variety
        if (/[a-z]/.test(password)) strength += 10;
        if (/[A-Z]/.test(password)) strength += 10;
        if (/[0-9]/.test(password)) strength += 10;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;

        // Update display
        strengthBar.className = 'strength-bar';
        if (strength < 50) {
            strengthBar.classList.add('strength-weak');
            feedback = 'Weak';
        } else if (strength < 75) {
            strengthBar.classList.add('strength-fair');
            feedback = 'Fair';
        } else if (strength < 90) {
            strengthBar.classList.add('strength-good');
            feedback = 'Good';
        } else {
            strengthBar.classList.add('strength-strong');
            feedback = 'Strong';
        }

        strengthText.textContent = feedback;
    }

    displayPasswords() {
        const passwordList = document.getElementById('passwordList');
        passwordList.innerHTML = '';

        if (this.passwords.length === 0) {
            passwordList.innerHTML = '<p>No passwords saved yet. Add your first password above!</p>';
            return;
        }

        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        const filteredPasswords = this.passwords.filter(item => {
            const matchesSearch = item.site.toLowerCase().includes(searchTerm) || 
                                item.username.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        filteredPasswords.forEach(item => {
            const passwordElement = document.createElement('div');
            passwordElement.className = 'password-item';
            passwordElement.innerHTML = `
                <div class="password-header">
                    <div>
                        <span class="site-name">${this.escapeHtml(item.site)}</span>
                        <span class="category-badge">${this.escapeHtml(item.category)}</span>
                    </div>
                    <div class="password-actions">
                        <button class="view-btn" onclick="passwordManager.togglePassword(${item.id})">Show</button>
                        <button class="copy-btn" onclick="passwordManager.copyToClipboard('${this.escapeHtml(item.password)}')">Copy Password</button>
                        <button class="copy-btn" onclick="passwordManager.copyToClipboard('${this.escapeHtml(item.username)}')">Copy Username</button>
                        <button class="delete-btn" onclick="passwordManager.deletePassword(${item.id})">Delete</button>
                    </div>
                </div>
                <div><strong>Username:</strong> ${this.escapeHtml(item.username)}</div>
                <div class="password-display" id="password-${item.id}">
                    <strong>Password:</strong> <span class="hidden-password">••••••••</span>
                    <span class="actual-password hidden">${this.escapeHtml(item.password)}</span>
                </div>
                <div class="password-date"><small>Added: ${new Date(item.createdAt).toLocaleDateString()}</small></div>
            `;
            passwordList.appendChild(passwordElement);
        });
    }

    togglePassword(id) {
        const hiddenElement = document.querySelector(`#password-${id} .hidden-password`);
        const actualElement = document.querySelector(`#password-${id} .actual-password`);
        
        if (hiddenElement.classList.contains('hidden')) {
            hiddenElement.classList.remove('hidden');
            actualElement.classList.add('hidden');
        } else {
            hiddenElement.classList.add('hidden');
            actualElement.classList.remove('hidden');
        }
    }

    filterPasswords() {
        this.displayPasswords();
    }

    updateStatistics() {
        document.getElementById('totalPasswords').textContent = this.passwords.length;
        
        const weakPasswords = this.passwords.filter(item => item.password.length < 8).length;
        document.getElementById('weakPasswords').textContent = weakPasswords;
        
        const passwordCounts = {};
        this.passwords.forEach(item => {
            passwordCounts[item.password] = (passwordCounts[item.password] || 0) + 1;
        });
        const reusedPasswords = Object.values(passwordCounts).filter(count => count > 1).length;
        document.getElementById('reusedPasswords').textContent = reusedPasswords;
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    }

    copyPassword() {
        const password = document.getElementById('generatedPassword').value;
        if (password) {
            this.copyToClipboard(password);
        }
    }

    deletePassword(id) {
        if (confirm('Are you sure you want to delete this password?')) {
            this.passwords = this.passwords.filter(item => item.id !== id);
            this.savePasswords();
            this.displayPasswords();
            this.updateStatistics();
        }
    }

    exportData() {
        if (!this.isUnlocked) {
            alert('Please unlock with master password first');
            return;
        }

        const data = JSON.stringify(this.passwords, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'password-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importData() {
        document.getElementById('importFile').click();
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (confirm(`This will import ${importedData.length} passwords. Continue?`)) {
                    this.passwords = importedData;
                    this.savePasswords();
                    this.displayPasswords();
                    this.updateStatistics();
                    alert('Data imported successfully!');
                }
            } catch (error) {
                alert('Error importing data: Invalid file format');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    toggleMasterPassword() {
        if (this.masterPassword) {
            if (confirm('Change master password? You will need to re-enter it to access your passwords.')) {
                localStorage.removeItem('masterPasswordHash');
                localStorage.removeItem('encryptedPasswords');
                location.reload();
            }
        } else {
            document.getElementById('masterPasswordSection').classList.remove('hidden');
        }
    }
}

// Initialize the password manager
const passwordManager = new PasswordManager();

// Set up file import handler
document.getElementById('importFile').addEventListener('change', (e) => passwordManager.handleImport(e));

// Global functions for HTML onclick handlers
function addPassword() { passwordManager.addPassword(); }
function generatePassword() { passwordManager.generatePassword(); }
function copyPassword() { passwordManager.copyPassword(); }
function filterPasswords() { passwordManager.filterPasswords(); }
function setMasterPassword() { passwordManager.setMasterPassword(); }
function login() { passwordManager.login(); }
function exportData() { passwordManager.exportData(); }
function importData() { passwordManager.importData(); }
function toggleMasterPassword() { passwordManager.toggleMasterPassword(); }
