package app.melendo.forjahabito;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(EntrenoPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
