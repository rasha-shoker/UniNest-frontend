function checkAccess(requiredRole) {
    const role = localStorage.getItem("loggedInRole");
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (!role || !loggedInUser) {
        alert("Please login first.");
        window.location.href = "login.html";
        return false;
    }

    // Resident pages: student OR employee
    if (requiredRole === "student" || requiredRole === "resident") {
        if (role !== "student" && role !== "employee") {
            alert("Access denied.");
            window.location.href = "login.html";
            return false;
        }

        return true;
    }

    // Admin pages: admin only
    if (requiredRole === "admin") {
        if (role !== "admin") {
            alert("Access denied.");
            window.location.href = "login.html";
            return false;
        }

        return true;
    }

    return true;
}

function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUserType");

    localStorage.removeItem("loggedInResidentId");
    localStorage.removeItem("loggedInAdminId");

    window.location.href = "login.html";
}

function getCurrentUserName() {
    return localStorage.getItem("loggedInUser") || "";
}

function getCurrentUserEmail() {
    return localStorage.getItem("loggedInUserEmail") || "";
}

function getCurrentUserRole() {
    return localStorage.getItem("loggedInRole") || "";
}

function getCurrentUserType() {
    return localStorage.getItem("loggedInUserType") || localStorage.getItem("loggedInRole") || "";
}

function getCurrentResidentId() {
    return localStorage.getItem("loggedInResidentId") || "";
}

function getCurrentAdminId() {
    return localStorage.getItem("loggedInAdminId") || "";
}

function isLoggedIn() {
    const role = localStorage.getItem("loggedInRole");
    const user = localStorage.getItem("loggedInUser");

    return !!role && !!user;
}

function isResidentLoggedIn() {
    const resident_id = localStorage.getItem("loggedInResidentId");
    const role = localStorage.getItem("loggedInRole");

    return !!resident_id && (role === "student" || role === "employee");
}

function isAdminLoggedIn() {
    const admin_id = localStorage.getItem("loggedInAdminId");
    const role = localStorage.getItem("loggedInRole");

    return !!admin_id && role === "admin";
}