function SketchfabAPIUTransformGeneric(matrixRef) {
    var classScope = this;
    this.matrix = matrixRef;
    this.matrixCached = matrixRef.slice(0);

    //ARRAYS / STORAGE --------------------------------------------------------------------------------------------------------

    this.vectorForward = [0, 0, 1];
    this.vectorBackward = [0, 0, -1];
    this.vectorLeft = [1, 0, 0];
    this.vectorRight = [-1, 0, 0];
    this.vectorUp = [0, 1, 0];
    this.vectorDown = [0, -1, 0];
    this.rotationAxisX = "rotationAxisX";
    this.rotationAxisY = "rotationAxisY";
    this.rotationAxisZ = "rotationAxisZ";
    var rotationAxisCache = {};
    rotationAxisCache[classScope.rotationAxisX] = {}
    rotationAxisCache[classScope.rotationAxisX].axis = [1, 0, 0];
    rotationAxisCache[classScope.rotationAxisX].angle = 0;

    rotationAxisCache[classScope.rotationAxisY] = {}
    rotationAxisCache[classScope.rotationAxisY].axis = [0, -1, 0];
    rotationAxisCache[classScope.rotationAxisY].angle = 0;

    rotationAxisCache[classScope.rotationAxisZ] = {}
    rotationAxisCache[classScope.rotationAxisZ].axis = [0, 0, -1];
    rotationAxisCache[classScope.rotationAxisZ].angle = 0;


    this.reset = function () {
        
        classScope.matrix = classScope.matrixCached.slice(0);
        rotationAxisCache[classScope.rotationAxisX].angle = 0;
        rotationAxisCache[classScope.rotationAxisY].angle = 0;
        rotationAxisCache[classScope.rotationAxisZ].angle = 0;
    }

    //-------------------------------------------------------------------------------------------------------------------------
    this.getRotation = function(){
        return [rotationAxisCache[classScope.rotationAxisX].angle, rotationAxisCache[classScope.rotationAxisY].angle, rotationAxisCache[classScope.rotationAxisZ].angle];
    }
   

    //-------------------------------------------------------------------------------------------------------------------------

    this.getPosition = function () {
        return [classScope.matrix[12], classScope.matrix[13], classScope.matrix[14]];
    };

    //-------------------------------------------------------------------------------------------------------------------------

    this.setPosition = function (position) {
        classScope.matrix[12] = position[0];
        classScope.matrix[13] = position[1];
        classScope.matrix[14] = position[2];
    };

    this.getIdentityMatrix = function () {
        var out = [];
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[0] = 1;
        out[5] = 1;
        out[10] = 1;
        out[15] = 1;
        return out;
    };

    this.extractScale = function () {
        var sx = Math.hypot(classScope.matrix[0], classScope.matrix[1], classScope.matrix[2]);
        var sy = Math.hypot(classScope.matrix[4], classScope.matrix[5], classScope.matrix[6]);
        var sz = Math.hypot(classScope.matrix[8], classScope.matrix[9], classScope.matrix[10]);
        return [sx, sy, sz];

    };

    this.translate = function (v) {
        var out = [];
        var a = classScope.matrix;
        a[12] = 0;
        a[13] = 0;
        a[14] = 0;

        var x = v[0], y = v[1], z = v[2];
        var a00, a01, a02, a03;
        var a10, a11, a12, a13;
        var a20, a21, a22, a23;
        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        } else {
            a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
            a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
            a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
            out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
            out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
            out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }
        classScope.matrix = out;
    };

    this.scale = function (v) {
        var out = [];
        var a = classScope.matrix;
        var x = v[0], y = v[1], z = v[2];
        out[0] = a[0] * x;
        out[1] = a[1] * x;
        out[2] = a[2] * x;
        out[3] = a[3] * x;
        out[4] = a[4] * y;
        out[5] = a[5] * y;
        out[6] = a[6] * y;
        out[7] = a[7] * y;
        out[8] = a[8] * z;
        out[9] = a[9] * z;
        out[10] = a[10] * z;
        out[11] = a[11] * z;
        out[12] = a[12] * x;
        out[13] = a[13] * y;
        out[14] = a[14] * z;
        out[15] = a[15];
        classScope.matrix = out;
    }

    this.multiply = function (a, b) {
        var out = [];
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        // Cache only the current line of the second matrix
        var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        return out;
    }

    this.invert = function () {
        var out = [];
        var a = classScope.matrix;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return out;
    }

    //-------------------------------------------------------------------------------------------------------------------------


    function adjoint() {
        var out = [];
        var a = classScope.matrix;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        out[0] = (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
        out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
        out[2] = (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
        out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
        out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
        out[5] = (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
        out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
        out[7] = (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
        out[8] = (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
        out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
        out[10] = (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
        out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
        out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
        out[13] = (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
        out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
        out[15] = (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
        return out;
    }

    //-------------------------------------------------------------------------------------------------------------------------

    this.determinant = function () {
        var a = classScope.matrix;
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    };

    //-------------------------------------------------------------------------------------------------------------------------


    this.AddMatrix = function (matrixRef) {
        classScope.matrix[0] = classScope.matrix[0] + matrixRef[0];
        classScope.matrix[1] = classScope.matrix[1] + matrixRef[1];
        classScope.matrix[2] = classScope.matrix[2] + matrixRef[2];
        classScope.matrix[3] = classScope.matrix[3] + matrixRef[3];
        classScope.matrix[4] = classScope.matrix[4] + matrixRef[4];
        classScope.matrix[5] = classScope.matrix[5] + matrixRef[5];
        classScope.matrix[6] = classScope.matrix[6] + matrixRef[6];
        classScope.matrix[7] = classScope.matrix[7] + matrixRef[7];
        classScope.matrix[8] = classScope.matrix[8] + matrixRef[8];
        classScope.matrix[9] = classScope.matrix[9] + matrixRef[9];
        classScope.matrix[10] = classScope.matrix[10] + matrixRef[10];
        classScope.matrix[11] = classScope.matrix[11] + matrixRef[11];
        classScope.matrix[12] = classScope.matrix[12] + matrixRef[12];
        classScope.matrix[13] = classScope.matrix[13] + matrixRef[13];
        classScope.matrix[14] = classScope.matrix[14] + matrixRef[14];
        classScope.matrix[15] = classScope.matrix[15] + matrixRef[15];
    }

    //-------------------------------------------------------------------------------------------------------------------------
    // this only changes the matrix object, it does not perform anything on the api. This is to overcome structural difference with handling matrix objects on different scene objects
    this.setPositionX = function (singleAxisPosition) {

        var currentPosition = [singleAxisPosition, classScope.matrix[13], classScope.matrix[14]];
        classScope.matrix[12] = singleAxisPosition;
        return classScope.matrix;

    };
    //
   
    //-------------------------------------------------------------------------------------------------------------------------

    this.setPositionY = function (singleAxisPosition) {

        var currentPosition = [classScope.matrix[12], singleAxisPosition, classScope.matrix[14]];
        classScope.matrix[13] = singleAxisPosition;
        return classScope.matrix;

    };

    //-------------------------------------------------------------------------------------------------------------------------

    this.setPositionZ = function (singleAxisPosition) {

        var currentPosition = [classScope.matrix[12], classScope.matrix[13], singleAxisPosition];
        classScope.matrix[14] = singleAxisPosition;
        return classScope.matrix;

    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.getVectorMagnitude = function (vector) {
        return Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]));

    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.getVectorNormalized = function (vector) {
        var mag = classScope.getVectorMagnitude(vector);
        vector[0] /= mag;
        vector[1] /= mag;
        vector[2] /= mag;
        return vector;
    };

    //--------------------------------------------------------------------------------------------------------------------------

    this.combineVectorDirections = function () {
        var directionCombined = [0, 0, 0];
        for (var i = 0; i < arguments.length; i++) {
            directionCombined[0] += arguments[i][0];
            directionCombined[1] += arguments[i][1];
            directionCombined[2] += arguments[i][2];
        }
        return classScope.getVectorNormalized(directionCombined);
    };

    //--------------------------------------------------------------------------------------------------------------------------


    this.rotateOnAxis = function (angleEnd, axisName) {
        var rc = rotationAxisCache[axisName];
        if (rc === null || rc === undefined) {
            console.error("calling rotateOnAxis in SketchfabAPIUTransformGeneric has failed could not retrieve a reference to  rotationAxisCache member using the passed in axisName argument :: " + axisName);
            return;
        }
        angleEnd = parseFloat(angleEnd);
        var axis = rc.axis;
        var angle = angleEnd - rc.angle;
        var atemp = angle;       
        if (atemp < 0) {
            atemp = rc.angle +  atemp;
            rc.angle = atemp;
        } else {
            rc.angle = angleEnd;
        }
       
        var rad = angle * 0.0174533;
        var out = [];
        var a = classScope.matrix;

        var x = axis[0], y = axis[1], z = axis[2];
        var len = Math.hypot(x, y, z);
        var s, c, t;
        var a00, a01, a02, a03;
        var a10, a11, a12, a13;
        var a20, a21, a22, a23;
        var b00, b01, b02;
        var b10, b11, b12;
        var b20, b21, b22;
        if (len < 0.000001) { return null; }
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c;
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
        // Construct the elements of the rotation matrix
        b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
        b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
        b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
        // Perform rotation-specific matrix multiplication
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;
        if (a !== out) { // If the source and destination differ, copy the unchanged last row
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }
        classScope.matrix = out;
        return out;

    };

    //--------------------------------------------------------------------------------------------------------------------------

    //--------------------------------------------------------------------------------------------------------------------------




};