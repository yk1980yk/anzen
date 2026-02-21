export async function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("位置情報がサポートされていません");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        reject("位置情報の取得に失敗しました: " + err.message);
      }
    );
  });
}
