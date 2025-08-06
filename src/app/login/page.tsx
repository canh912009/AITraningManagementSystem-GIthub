export default function LoginPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#333'
                }}>Admin Login</h1>

                <form id="loginForm">
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold'
                        }}>Số điện thoại:</label>
                        <input
                            type="tel"
                            id="phone"
                            placeholder="0123456789"
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold'
                        }}>Mật khẩu:</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Nhập mật khẩu"
                            required
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Đăng nhập
                    </button>

                    <div id="error" style={{
                        color: 'red',
                        marginTop: '10px',
                        display: 'none'
                    }}></div>
                </form>

                {/*<div style={{*/}
                {/*    textAlign: 'center',*/}
                {/*    marginTop: '20px',*/}
                {/*    color: '#666',*/}
                {/*    fontSize: '14px'*/}
                {/*}}>*/}
                {/*    Demo: 0123456789 / admin123*/}
                {/*</div>*/}
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
          document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');
            
            try {
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
              });
              
              const data = await response.json();
              
              if (data.success && data.data.user.isAdmin) {
                localStorage.setItem('adminToken', data.data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.data.user));
                window.location.href = '/admin/dashboard';
              } else {
                errorDiv.textContent = data.error || 'Đăng nhập thất bại';
                errorDiv.style.display = 'block';
              }
            } catch (error) {
              errorDiv.textContent = 'Có lỗi xảy ra: ' + error.message;
              errorDiv.style.display = 'block';
            }
          });
        `
            }} />
        </div>
    )
}