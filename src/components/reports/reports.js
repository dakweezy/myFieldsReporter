import React, {Component} from 'react';
import './reports.css';
import SearchableList from '../searchableList/searchableList';
import * as firebase from 'firebase';
import {HashRouter as Router, Route, Switch, Link} from 'react-router-dom';
import GeoLocation from '../GeoLocation/GeoLocation';

export default class Reports extends Component {
    constructor(props) {
        super(props);
        this.state = {
            crop: '',
            gs: '',
            location: {},
            images: [],
            pest: '',
            notes: '',
            view: 'current',
            list: [],
            reports: [],
            test: '',
            rName: ''
        }
        this.handleCreate = this.handleCreate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleLocation = this.handleLocation.bind(this);
        this.toggleView = this.toggleView.bind(this);
        this.readFile = this.readFile.bind(this);
        this.getReports();
        
    }
    
    handleLocation(coords){
        this.setState({location: coords});
    }
    
    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
    
    handleCreate(){
        var fid = firebase.database().ref('reports/').push().key;
        var photos = this.state.images;
        var uid = firebase.auth().currentUser.uid;
        
        firebase.database().ref('users/' + uid).once('value').then((snapshot) => {
            var user = snapshot.val();
            var reportCount = Object.keys(user.reports).length;
            
      
              this.setState({rName : user.fName.concat(user.lName.concat(reportCount))} );
              console.log(this.state.rName);
              
              var updates = {}
              updates['reports/' + fid] = {
                    crop: this.state.crop,
                    location: this.state.location.latitude + "," + this.state.location.longitude,
                    gs: this.state.gs,
                    pest: this.state.pest,
                    notes: this.state.notes,
                    time: Date().toString(),
                    owner: uid,
                    name: this.state.rName
                  }
                updates['users/' + uid + '/reports/' + fid] = true;
                firebase.database().ref().update(updates).then(() => {
                    photos.forEach((imageURL, index) => {
                        firebase.storage().ref().child('images').child(fid).child(index.toString()).put(imageURL).then(snapshot => {

                            firebase.database().ref('reports/' + fid + '/images').push(snapshot.downloadURL)
                        })
                    });

                }).catch(err => console.error(err));

           });
        
        console.log(this.state.rName);
        
        
        this.toggleView();
        
        this.setState({
            crop: '',
            gs: '',
            location: '',
            images: [],
            pest: '',
            notes: '',
            view: 'current',
            list: []
        })
        
        
    }
    
    getReports(){
    
        var info = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/reports/').key;
        
        
    }
        
    toggleView(){
        this.setState({view:(this.state.view== 'newReport')?'current':'newReport'})
    }
    
    
    readFile(event) {
        var file = event.target.files[0];
        var reader = new FileReader();

        reader.onloadend = () => {
            this.state.images[this.state.images.length] = file;
            
        }

        reader.onerror = function () {
            alert('There was an error reading the file!');
        }
        reader.readAsDataURL(file);
    }

    
    
    render() {
                    if (window.File && window.FileReader && window.FormData) {
                    var $inputField = this.state.file;

                } else {
                    alert("File upload is not supported!");
                    
                }
        
            if(this.state.view == 'current'){
                firebase.database().ref('/users/'+firebase.auth().currentUser.uid+'/reports/').on('value', snap =>  {

                           var data = [];
                           snap.forEach(ss => {
                              data.push(ss.child('name').val());
                           });
                            this.state.reports = data;
                        })
                 
                
                return (
                    <div className="container">
            
                        <button onClick={this.toggleView}>Create Report</button>
                       
                        <h1>Your Reports</h1>
                        
                        <br/><br/>
                    </div>
                );
            }
            else
                {
                    
                    var imageTags = this.state.images.map((imageURL, index) => {
                        return <img key={index} src={imageURL}/>
                    })
                    firebase.database().ref('crops/').on('value', snap =>  {
                           var data = [];
                           snap.forEach(ss => {
                              data.push(ss.child('name').val());
                           });
                            this.state.list = data;
                           //console.log(this.state.list);
                           //console.log(this.state.list.pop());
                        })
                    
                    return(
                         
                        <div className="reports-container">
                            <h1>New Report</h1>
                        
                            <input placeholder="Name of Field" name="field" value={this.state.field} onChange={this.handleChange} required />
                            <br/>
                        
                            <div className="list-container">
                                <SearchableList onChange={this.handleChange} placeholder='Crop' listRef="crops/"/>
                            </div>
                        

                            <input placeholder="Growth Stage of Crop" name="gs" value={this.state.gs} onChange={this.handleChange} required />
                            
                            <br/>
                        
                            <input placeholder="Pest" name="pest" value={this.state.pest} onChange={this.handleChange} required />
                            
                            
                            <GeoLocation location={this.state.location} onChange={this.handleLocation}></GeoLocation>
                            
                            <input id="file" type="file" accept="image/*" onChange={this.readFile}></input>
                            <input id="file" type="file" accept="image/*" onChange={this.readFile}></input>
                            
                            <input placeholder="Notes" name="notes" value={this.state.notes} onChange={this.handleChange}/>
                            
                            <button onClick={this.handleCreate}>Submit</button>
                            
                            {this.state.message}

                            <a onClick={this.toggleView}>Go To Dashboard</a>
                        </div>

                    )
                }
    }
    
}
