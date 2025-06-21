<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Masjid Taqwa Muhammadiyah</title>

    <!-- Midtrans SDK - Load before React to ensure it's available -->
    <script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key="{{ config('midtrans.client_key') }}">
    </script>

    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
</head>
<body>
    <div id="app"></div>

    <!-- Debug info in development only -->
    @if(config('app.env') === 'local')
    <script>
        console.log('Midtrans Client Key: {{ config('midtrans.client_key') }}');
        console.log('Midtrans Environment: {{ config('midtrans.is_production') ? 'Production' : 'Sandbox' }}');
        
        // Verify Midtrans is loaded
        window.addEventListener('load', function() {
            if (typeof window.snap !== 'undefined') {
                console.log('Midtrans snap is loaded and ready to use');
            } else {
                console.error('Midtrans snap is NOT loaded! Check your configuration.');
            }
        });
    </script>
    @endif
</body>
</html>