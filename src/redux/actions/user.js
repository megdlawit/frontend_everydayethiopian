import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
// load user
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    });
    const { data } = await axios.get(`${server}/user/getuser`, {
      withCredentials: true,
    });
    dispatch({
      type: "LoadUserSuccess",
      payload: {
        ...data.user,
        avatar: {
          ...data.user.avatar,
          url: data.user.avatar.url.replace(/\\/g, "/"), // Ensure correct URL format
        },
      },
    });
    console.log("Loaded user avatar URL:", data.user.avatar.url); // Log the avatar URL
  } catch (error) {
    dispatch({
      type: "LoadUserFail",
      payload: error.response.data.message,
    });
  }
};

// load seller
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadSellerRequest",
    });
    const { data } = await axios.get(`${server}/shop/getSeller`, {
      withCredentials: true,
    });
    dispatch({
      type: "LoadSellerSuccess",
      payload: data.seller,
    });
  } catch (error) {
    dispatch({
      type: "LoadSellerFail",
      payload: error.response.data.message,
    });
  }
};

// In your user actions file
export const updateUserInformation = (name, email, phoneNumber) => async (dispatch) => {
  try {
    dispatch({
      type: "updateUserInfoRequest",
    });

    const { data } = await axios.put(
      `${server}/user/update-user-info`,
      { name, email, phoneNumber }, // Fixed parameter order
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    dispatch({
      type: "updateUserInfoSuccess",
      payload: data.user,
    });
    
    return data; // Return data for error handling
  } catch (error) {
    console.error("Update user info error:", error);
    dispatch({
      type: "updateUserInfoFailed",
      payload: error.response?.data?.message || "Failed to update user information",
    });
    throw error; // Throw error to handle in component
  }
};
// user update information
// export const updateUserInformation =
//   (name, email, phoneNumber) => async (dispatch) => {
//     try {
//       dispatch({
//         type: "updateUserInfoRequest",
//       });

//       const { data } = await axios.put(
//         `${server}/user/update-user-info`,
//         { email, phoneNumber, name },
//         {
//           withCredentials: true,
//           headers: {
//             "Access-Control-Allow-Credentials": true,
//           },
//         }
//       );

//       dispatch({
//         type: "updateUserInfoSuccess",
//         payload: data.user,
//       });
//     } catch (error) {
//       dispatch({
//         type: "updateUserInfoFailed",
//         payload: error.response?.data?.message || error.message,
//       });
//     }
//   };

// update user address
export const updateUserAddress = (country, city, address1, addressType) => async (dispatch) => {
  try {
    dispatch({
      type: "updateUserAddressRequest",
    });
    const { data } = await axios.put(
      `${server}/user/update-user-addresses`,
      { country, city, address1, addressType },
      { withCredentials: true }
    );
    dispatch({
      type: "updateUserAddressSuccess",
      payload: {
        successMessage: "User address updated successfully!",
        user: data.user,
      },
    });
  } catch (error) {
    dispatch({
      type: "updateUserAddressFailed",
      payload: error.response?.data?.message || "Failed to update address",
    });
  }
};


// delete user address
export const deleteUserAddress = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteUserAddressRequest",
    });

    const { data } = await axios.delete(
      `${server}/user/delete-user-address/${id}`,
      { withCredentials: true }
    );

    dispatch({
      type: "deleteUserAddressSuccess",
      payload: {
        successMessage: "User deleted successfully!",
        user: data.user,
      },
    });
  } catch (error) {
    dispatch({
      type: "deleteUserAddressFailed",
      payload: error.response.data.message,
    });
  }
};

// get all users --- admin
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllUsersRequest",
    });

    const { data } = await axios.get(`${server}/user/admin-all-users`, {
      withCredentials: true,
    });

    dispatch({
      type: "getAllUsersSuccess",
      payload: data.users,
    });
  } catch (error) {
    dispatch({
      type: "getAllUsersFailed",
      payload: error.response.data.message,
    });
  }
};

// forgot password
export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch({
      type: "ForgotPasswordRequest",
    });

    const { data } = await axios.post(`${server}/user/password/forgot`, { email });

    dispatch({
      type: "ForgotPasswordSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "ForgotPasswordFail",
      payload: error.response.data.message,
    });
  }
};

// reset password
// export const resetPassword = (token, password, confirmPassword) => async (dispatch) => {
//   try {
//     dispatch({
//       type: "ResetPasswordRequest",
//     });

//     const { data } = await axios.put(`${server}/user/password/reset/${token}`, {
//       password,
//       confirmPassword,
//     });

//     dispatch({
//       type: "ResetPasswordSuccess",
//       payload: data.success,
//     });
//   } catch (error) {
//     dispatch({
//       type: "ResetPasswordFail",
//       payload: error.response.data.message,
//     });
//   }
// };

// Example resetPassword action
export const resetPassword = (token, password, confirmPassword) => async (dispatch) => {
  try {
    const response = await axios.put(`${server}/user/password/reset/${token}`, {
      password,
      confirmPassword,
    });
    dispatch({
      type: "ResetPasswordSuccess",
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: "ResetPasswordFail",
      payload: error.response ? error.response.data.message : error.message,
    });
    throw error; // For handling in component
  }
};

export const activateUser = (activationToken) => async (dispatch) => {
  try {
    dispatch({ type: "ActivateUserRequest" });

    const { data } = await axios.post(`${server}/user/activation`, {
      activation_token: activationToken,
    });

    dispatch({
      type: "ActivateUserSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "ActivateUserFail",
      payload: error.response.data.message,
    });
  }
};

export const signupUser = (name, email, password, avatar) => async (dispatch) => {
  try {
    dispatch({ type: "LoadUserRequest" });

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    const { data } = await axios.post(`${server}/user/create-user`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true, // Include credentials if needed
    });

    dispatch({
      type: "LoadUserSuccess",
      payload: {
        ...data.user,
        avatar: {
          ...data.user.avatar,
          url: data.user.avatar.url.replace(/\\/g, "/"), // Ensure correct URL format
        },
      },
    });

    dispatch({
      type: "SignupSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "LoadUserFail",
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};