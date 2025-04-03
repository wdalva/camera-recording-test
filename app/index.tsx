import { Camera, CameraView } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";

export default function Index() {
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoQuality, setVideoQuality] = useState<"480p" | "720p">("480p");
  const bitrate = videoQuality === "480p" ? 300_000 : 1_000_000;

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    if (cameraRef.current) {
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 300,
        });

        //Grabar el video en la galería, no debería necesitarse si se va a hacer upload.
        if (video) {
          const asset = await MediaLibrary.createAssetAsync(video.uri);
          await MediaLibrary.createAlbumAsync("MyAppVideos", asset, false);
        }
        console.log("Video grabado:", video); //TODO: Upload.
        setIsRecording(false);
      } catch (error) {
        console.error("Error al grabar video:", error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  if (hasPermission === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Text>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Text>Sin acceso a la cámara</Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#007BFF",
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
          }}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Dar Acceso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CameraView
        mode="video"
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        mute
        videoQuality={videoQuality}
        videoBitrate={bitrate}
      />

      <View style={{ flexDirection: "row", gap: 2, marginTop: 16 }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: videoQuality === "480p" ? "blue" : "gray",
          }}
          onPress={() => setVideoQuality("480p")}
        >
          <Text style={{ color: "white" }}>480p</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: videoQuality === "720p" ? "blue" : "gray",
          }}
          onPress={() => setVideoQuality("720p")}
        >
          <Text style={{ color: "white" }}>720p</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={{
            backgroundColor: isRecording ? "red" : "white",
            width: 50,
            height: 50,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>{isRecording ? "Detener" : "Grabar"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
