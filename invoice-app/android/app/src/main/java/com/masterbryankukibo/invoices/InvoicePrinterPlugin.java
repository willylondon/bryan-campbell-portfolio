package com.masterbryankukibo.invoices;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "InvoicePrinter")
public class InvoicePrinterPlugin extends Plugin {
    @PluginMethod
    public void print(PluginCall call) {
        final String jobName = call.getString("jobName", "Master Bryan Kukibo Invoice");

        getActivity().runOnUiThread(() -> {
            WebView webView = getBridge().getWebView();
            PrintManager printManager = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);

            if (printManager == null) {
                call.reject("Android printing is unavailable on this device.");
                return;
            }

            PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(jobName);
            PrintAttributes attributes = new PrintAttributes.Builder()
                .setMediaSize(PrintAttributes.MediaSize.NA_LETTER.asPortrait())
                .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                .build();

            printManager.print(jobName, adapter, attributes);
            call.resolve(new JSObject());
        });
    }
}
