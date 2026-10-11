# Supabase giriş ayarları

`login-auth.js` bu ayarlarla birlikte çalışır. Ayarlar Supabase panelinden yapılır,
repoda tutulmaz.

## 1. Yönlendirme adresleri

**Authentication → URL Configuration**

- Site URL: `https://atelify.aruntas.com`
- Redirect URLs: `https://atelify.aruntas.com/login**`

Mail linkleri `/login?mode=signup&next=...` ya da `/login?mode=recovery&next=...`
adresine döner. Bu adres listede yoksa Supabase linki Site URL'ye düşürür ve akış bozulur.

## 2. Mail şablonları (her cihazda çalışan linkler)

**Authentication → Email Templates**

Varsayılan şablonlar `{{ .ConfirmationURL }}` kullanır. Bu link (PKCE `?code=`) sadece
üyeliğin ya da şifre sıfırlamanın istendiği tarayıcıda açılırsa çalışır. Şablondaki
linki aşağıdakiyle değiştirince doğrulama, linkin açıldığı cihazdan bağımsız olur.

**Confirm signup**

```html
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">E-postamı doğrula</a>
```

**Reset password**

```html
<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">Şifremi sıfırla</a>
```

`{{ .RedirectTo }}` her zaman en az bir sorgu parametresi (`mode=...`) taşır; bu yüzden
sonuna `&` ile eklemek güvenlidir. Eski `?code=` linkleri de çalışmaya devam eder.

## 3. Şifre kuralı

**Authentication → Providers → Email → Minimum password length:** `8`

Arayüz 8 karakterin altını zaten kabul etmez; sunucuda da aynı sınır olsun diye.
